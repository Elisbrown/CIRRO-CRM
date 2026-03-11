"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useSession } from "next-auth/react";

interface VideoCallContextType {
    callState: 'idle' | 'ringing' | 'calling' | 'connected' | 'rejected';
    incomingCall: { from: string; fromName: string; type: 'video' | 'audio' } | null;
    startCall: (targetUserId: string, type: 'video' | 'audio') => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => void;
    endCall: () => void;
    toggleMute: () => void;
    toggleVideo: () => void;
    isMuted: boolean;
    isVideoOff: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    remoteUserName: string;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
};

export function VideoCallProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const { socket, emitCallUser, emitMakeAnswer, emitIceCandidate, emitRejectCall, emitEndCall } = useSocket();
    
    const [callState, setCallState] = useState<'idle' | 'ringing' | 'calling' | 'connected' | 'rejected'>('idle');
    const [incomingCall, setIncomingCall] = useState<{ from: string; fromName: string; type: 'video' | 'audio', offer: any } | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [remoteUserId, setRemoteUserId] = useState<string | null>(null);
    const [remoteUserName, setRemoteUserName] = useState<string>("");
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null); // For ringtone

    useEffect(() => {
        if (!socket) return;

        socket.on("incoming-call", (data: any) => {
            console.log("Incoming call from:", data.fromName);
            setIncomingCall(data);
            setCallState('ringing');
            setRemoteUserId(data.from);
            setRemoteUserName(data.fromName);
            // Play ringtone here if desired
        });

        socket.on("call-answered", async (data: any) => {
            console.log("Call answered by:", data.from);
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                setCallState('connected');
            }
        });

        socket.on("ice-candidate", async (data: any) => {
            if (peerConnection.current && data.candidate) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    console.error("Error adding ice candidate", e);
                }
            }
        });

        socket.on("call-rejected", () => {
            console.log("Call rejected");
            setCallState('rejected');
            cleanup();
            setTimeout(() => setCallState('idle'), 3000);
        });

        socket.on("call-ended", () => {
            console.log("Call ended");
            cleanup();
            setCallState('idle');
        });

        return () => {
            socket.off("incoming-call");
            socket.off("call-answered");
            socket.off("ice-candidate");
            socket.off("call-rejected");
            socket.off("call-ended");
        };
    }, [socket]);

    const cleanup = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setRemoteStream(null);
        setIncomingCall(null);
        setRemoteUserId(null);
        setIsMuted(false);
        setIsVideoOff(false);
    };

    const createPeerConnection = (targetId: string) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                emitIceCandidate({ to: targetId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            console.log("Received remote track");
            setRemoteStream(event.streams[0]);
        };

        peerConnection.current = pc;
        return pc;
    };

    const startCall = async (targetUserId: string, type: 'video' | 'audio') => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: type === 'video',
                audio: true,
            });
            setLocalStream(stream);
            setCallState('calling');
            setRemoteUserId(targetUserId);

            const pc = createPeerConnection(targetUserId);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            emitCallUser({
                to: targetUserId,
                offer: offer,
                fromName: session?.user?.name || "Staff",
                type: type
            });
        } catch (err) {
            console.error("Error starting call:", err);
            cleanup();
            setCallState('idle');
        }
    };

    const acceptCall = async () => {
        if (!incomingCall) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: incomingCall.type === 'video',
                audio: true,
            });
            setLocalStream(stream);
            setCallState('connected');

            const pc = createPeerConnection(incomingCall.from);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            emitMakeAnswer({ to: incomingCall.from, answer });
            setIncomingCall(null);
        } catch (err) {
            console.error("Error accepting call:", err);
            cleanup();
            setCallState('idle');
        }
    };

    const rejectCall = () => {
        if (incomingCall) {
            emitRejectCall({ to: incomingCall.from });
        }
        cleanup();
        setCallState('idle');
    };

    const endCall = () => {
        if (remoteUserId) {
            emitEndCall({ to: remoteUserId });
        }
        cleanup();
        setCallState('idle');
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <VideoCallContext.Provider value={{
            callState,
            incomingCall,
            startCall,
            acceptCall,
            rejectCall,
            endCall,
            toggleMute,
            toggleVideo,
            isMuted,
            isVideoOff,
            localStream,
            remoteStream,
            remoteUserName,
        }}>
            {children}
        </VideoCallContext.Provider>
    );
}

export function useVideoCall() {
    const context = useContext(VideoCallContext);
    if (context === undefined) {
        throw new Error("useVideoCall must be used within a VideoCallProvider");
    }
    return context;
}
