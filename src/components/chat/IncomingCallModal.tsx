"use client";

import React from "react";
import { useVideoCall } from "@/contexts/video-call-context";
import { Phone, PhoneOff, Video, X } from "lucide-react";

export function IncomingCallModal() {
    const { incomingCall, acceptCall, rejectCall, callState } = useVideoCall();

    if (callState !== 'ringing' || !incomingCall) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-900 animate-ping opacity-20"></div>
                        <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center text-white text-3xl font-bold">
                            {incomingCall.fromName.charAt(0)}
                        </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{incomingCall.fromName}</h3>
                    <p className="text-gray-500 flex items-center gap-2 mb-8">
                        {incomingCall.type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                        Incoming {incomingCall.type} call...
                    </p>

                    <div className="flex gap-6 w-full">
                        <button
                            onClick={rejectCall}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 group"
                        >
                            <div className="bg-red-600 text-white p-3 rounded-full group-hover:rotate-12 transition-transform">
                                <PhoneOff className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Decline</span>
                        </button>
                        
                        <button
                            onClick={acceptCall}
                            className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 group"
                        >
                            <div className="bg-emerald-600 text-white p-3 rounded-full group-hover:-rotate-12 transition-transform">
                                <Phone className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Accept</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
