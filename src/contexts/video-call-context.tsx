"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useSession } from "next-auth/react";

interface VideoCallContextType {
    callState: 'idle' | 'calling' | 'connected';
    activeMeetingId: string | null;
    startMeeting: (meetingId: string, type: 'video' | 'audio') => Promise<void>;
    leaveMeeting: () => void;
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
    const { socket, emitJoinMeeting, emitMeetingSignal } = useSocket();
    
    const [callState, setCallState] = useState<'idle' | 'calling' | 'connected'>('idle');
    const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [remoteUserName, setRemoteUserName] = useState<string>("");
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

    const cleanup = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setRemoteStream(null);
        setActiveMeetingId(null);
        setCallState('idle');
        setRemoteUserName("");
        setIsMuted(false);
        setIsVideoOff(false);
        pendingCandidates.current = [];
    }, [localStream]);

    const initializePeerConnection = useCallback((targetSocketId: string, stream: MediaStream, isInitiator: boolean) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnection.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                emitMeetingSignal({ to: targetSocketId, signal: { type: 'candidate', candidate: event.candidate }, from: session?.user?.id || "" });
            }
        };

        pc.ontrack = (event) => {
            console.log("Remote track received");
            setRemoteStream(event.streams[0]);
            setCallState('connected');
        };

        return pc;
    }, [emitMeetingSignal, session?.user?.id]);

    useEffect(() => {
        if (!socket) return;

        socket.on("user-joined-meeting", async (data: { userId: string, userName: string, socketId: string }) => {
            console.log("Peer joined:", data.userName);
            setRemoteUserName(data.userName);
            
            // If we are already in the meeting, we initiate the offer to the newcomer
            if (localStream && peerConnection.current === null) {
                const pc = initializePeerConnection(data.socketId, localStream, true);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                emitMeetingSignal({ to: data.socketId, signal: { type: 'offer', offer }, from: session?.user?.id || "" });
            }
        });

        socket.on("meeting-signal", async (data: { signal: any, from: string, fromSocketId: string }) => {
            if (data.signal.type === 'offer') {
                console.log("Received offer from:", data.from);
                if (!localStream) return; // Should already be joined
                
                const pc = initializePeerConnection(data.fromSocketId, localStream, false);
                await pc.setRemoteDescription(new RTCSessionDescription(data.signal.offer));
                
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                emitMeetingSignal({ to: data.fromSocketId, signal: { type: 'answer', answer }, from: session?.user?.id || "" });
            } 
            else if (data.signal.type === 'answer') {
                console.log("Received answer");
                if (peerConnection.current) {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.signal.answer));
                }
            } 
            else if (data.signal.type === 'candidate') {
                if (peerConnection.current) {
                    try {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
                    } catch (e) {
                        console.error("Error adding candidate", e);
                    }
                }
            }
        });

        return () => {
            socket.off("user-joined-meeting");
            socket.off("meeting-signal");
        };
    }, [socket, localStream, initializePeerConnection, emitMeetingSignal, session?.user?.id]);

    const startMeeting = async (meetingId: string, type: 'video' | 'audio') => {
        try {
            cleanup();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: type === 'video',
                audio: true,
            });
            setLocalStream(stream);
            setCallState('calling');
            setActiveMeetingId(meetingId);

            emitJoinMeeting({ 
                meetingId, 
                userId: session?.user?.id || "0", 
                userName: session?.user?.name || "Staff" 
            });
        } catch (err) {
            console.error("Failed to get media devices:", err);
            alert("Could not access camera/microphone. Please ensure you are on HTTPS.");
        }
    };

    const leaveMeeting = () => {
        cleanup();
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
            activeMeetingId,
            startMeeting,
            leaveMeeting,
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
