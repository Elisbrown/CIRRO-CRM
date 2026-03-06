"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, User, Hash, FileText, CheckSquare, ShoppingBag, Printer, Truck } from "lucide-react";

interface TaggingInputProps {
    value: string;
    onChange: (val: string) => void;
    onEnter: () => void;
    placeholder?: string;
}

const CATEGORIES = [
    { id: "staff", label: "Staff", icon: User },
    { id: "groups", label: "Groups", icon: Hash },
    { id: "servicerequest", label: "Service Requests", icon: FileText },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "catalog", label: "Catalog Items", icon: ShoppingBag },
    { id: "machines", label: "Machines", icon: Printer },
    { id: "suppliers", label: "Suppliers", icon: Truck },
];

export function TaggingInput({ value, onChange, onEnter, placeholder }: TaggingInputProps) {
    const [showSelector, setShowSelector] = useState(false);
    const [step, setStep] = useState<"category" | "item">("category");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [filter, setFilter] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showSelector) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % (step === "category" ? CATEGORIES.length : items.length));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + (step === "category" ? CATEGORIES.length : items.length)) % (step === "category" ? CATEGORIES.length : items.length));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (step === "category") {
                    const cat = CATEGORIES[selectedIndex];
                    handleCategorySelect(cat.id);
                } else {
                    const item = items[selectedIndex];
                    handleItemSelect(item);
                }
            } else if (e.key === "Escape") {
                setShowSelector(false);
            }
        } else {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onEnter();
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        onChange(val);

        const lastChar = val[val.length - 1];
        const cursorPosition = e.target.selectionStart;
        const textBeforeCursor = val.substring(0, cursorPosition);

        if (textBeforeCursor.endsWith("@")) {
            setShowSelector(true);
            setStep("category");
            setSelectedIndex(0);
        } else if (showSelector) {
            // Find the tag start
            const lastAt = textBeforeCursor.lastIndexOf("@");
            const query = textBeforeCursor.substring(lastAt + 1);

            if (step === "item" && selectedCategory) {
                setFilter(query);
            } else if (query.includes(" ")) {
                setShowSelector(false);
            }
        }
    };

    useEffect(() => {
        if (showSelector && step === "item" && selectedCategory) {
            fetch(`/api/chat/tags?category=${selectedCategory}&query=${filter}`)
                .then(res => res.json())
                .then(json => {
                    setItems(json.data || []);
                    setSelectedIndex(0);
                });
        }
    }, [showSelector, step, selectedCategory, filter]);

    const handleCategorySelect = (catId: string) => {
        setSelectedCategory(catId);
        setStep("item");
        setFilter("");
        setSelectedIndex(0);
    };

    const handleItemSelect = (item: any) => {
        const lastAt = value.lastIndexOf("@");
        const name = item.firstName ? `${item.firstName} ${item.lastName}` : (item.name || item.title || item.requestId || item.serviceName);
        const newValue = value.substring(0, lastAt) + `@[${selectedCategory}:${item.id}](${name}) `;
        onChange(newValue);
        setShowSelector(false);
        inputRef.current?.focus();
    };

    return (
        <div className="relative">
            <textarea
                ref={inputRef}
                rows={1}
                className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none resize-none min-h-[44px]"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />

            {showSelector && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {step === "category" ? "Select Category" : `Searching ${selectedCategory}`}
                        </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {step === "category" ? (
                            CATEGORIES.map((cat, idx) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${idx === selectedIndex ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    <cat.icon className="h-4 w-4 shrink-0" />
                                    <span>{cat.label}</span>
                                </button>
                            ))
                        ) : (
                            items.length > 0 ? (
                                items.map((item, idx) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleItemSelect(item)}
                                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${idx === selectedIndex ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        <span className="truncate">
                                            {item.firstName ? `${item.firstName} ${item.lastName}` : (item.name || item.title || item.requestId || item.serviceName)}
                                        </span>
                                        {item.status && (
                                            <span className="ml-auto text-[10px] opacity-70 border border-current px-1 rounded uppercase">
                                                {item.status}
                                            </span>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-gray-400">No items found</div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
