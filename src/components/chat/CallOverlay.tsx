"use client";

import React, { useEffect, useRef } from "react";
import { useVideoCall } from "@/contexts/video-call-context";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2 } from "lucide-react";

export function CallOverlay() {
    const { 
        callState, 
        localStream, 
        remoteStream, 
        endCall, 
        toggleMute, 
        toggleVideo, 
        isMuted, 
        isVideoOff, 
        remoteUserName 
    } = useVideoCall();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    if (callState === 'idle' || callState === 'ringing' || callState === 'rejected') return null;

    return (
        <div className="fixed inset-0 bg-slate-950 z-[250] flex flex-col animate-in fade-in duration-500">
            {/* Main Remote View */}
            <div className="relative flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
                {remoteStream ? (
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-white text-3xl font-bold animate-pulse">
                            {remoteUserName?.charAt(0) || '?'}
                        </div>
                        <p className="text-slate-400 font-medium">
                            {callState === 'calling' ? 'Calling...' : 'Connecting...'}
                        </p>
                    </div>
                )}

                {/* Local Picture-in-Picture */}
                <div className="absolute top-6 right-6 w-32 md:w-48 aspect-video bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl z-30 group">
                    {localStream && !isVideoOff ? (
                        <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover -scale-x-100"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            <VideoOff className="h-6 w-6 text-slate-600" />
                        </div>
                    )}
                </div>

                {/* Remote Info Overlay */}
                <div className="absolute top-6 left-6 text-white z-10">
                    <h3 className="text-lg font-bold drop-shadow-md">{remoteUserName || "Searching..." }</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-slate-300 drop-shadow-md uppercase tracking-widest font-bold">
                            {callState === 'connected' ? 'Secure LAN Call' : 'Encrypted Signal'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="h-24 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center gap-4 md:gap-8 px-6 border-t border-slate-800/50">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all active:scale-90 ${
                        isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-all active:scale-90 ${
                        isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </button>

                <button
                    onClick={endCall}
                    className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all active:scale-90 shadow-lg shadow-red-900/20"
                >
                    <PhoneOff className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}
