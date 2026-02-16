// components/common/LogoSelector.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/shadcn/ui/label"; // adjust import path as per your setup
import Image from "next/image";
import { unknown } from "zod";

interface LogoSelectorProps {
    value: string; // current logo URL or empty
    onChange: (url: string) => void; // callback to parent form
}

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL;

export default function LogoSelector({ value, onChange }: LogoSelectorProps) {
    const [showModal, setShowModal] = useState(false);
    const [logos, setLogos] = useState<string[]>([]);
    const [selected, setSelected] = useState(value || "");
    const [logoTab, setLogoTab] = useState<"suggested" | "url">("suggested");
    const [urlInput, setUrlInput] = useState("");

    useEffect(() => {
        const fetchLogos = async () => {
            fetch(backendBaseUrl + "/imagekit/fromFolder/organisation_logos")
                .then(res => res.json())
                .then((data) => {
                    const logos = data.data?.map((item: any) => (item as { url: string }).url) || [];
                    setLogos(logos);
                })
                .catch(() => setLogos([]));
        };
        if (showModal) fetchLogos();
    }, [showModal]);

    return (
        <div className="w-full">

            <div className="flex gap-2 justify-center">
                {/* <Label htmlFor="logoImageUrl">Logo Image</Label> */}
                {value ? (
                    <Image
                        src={value}
                        alt="Logo Preview"
                        width={58}
                        height={58}
                        className="h-12 w-12 object-contain border rounded"
                    />
                ) : (
                    <div className="h-12 w-12 border flex items-center justify-center rounded text-xs">
                       Null
                    </div>
                )}

                <button
                    type="button"
                    className="px-2 bg-secondary py-2 rounded-sm text-xs"
                    onClick={() => setShowModal(true)}
                >
                    {value ? "Change Logo" : "Select Logo"}
                </button>

                {value && (
                    <button
                        type="button"
                        className="px-2 py-2 bg-orange-700 rounded-sm text-xs ml-2 text-white"
                        onClick={() => onChange("")}
                    >
                        Remove
                    </button>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-secondary rounded-lg shadow-lg p-6 w-full max-w-md relative">
                        <button
                            className="absolute top-2 right-2 text-lg"
                            onClick={() => setShowModal(false)}
                        >
                            &times;
                        </button>

                        {/* Tabs */}
                        <div className="mb-4 flex border-b">
                            <button
                                className={`px-3 py-2 text-sm ${logoTab === "suggested"
                                        ? "border-b-2 border-primary font-bold"
                                        : ""
                                    }`}
                                onClick={() => setLogoTab("suggested")}
                            >
                                Suggested
                            </button>
                            <button
                                className={`px-3 py-2 text-sm ${logoTab === "url"
                                        ? "border-b-2 border-blue-500 font-bold"
                                        : ""
                                    }`}
                                onClick={() => setLogoTab("url")}
                            >
                                URL
                            </button>
                        </div>

                        {/* Suggested Logos */}
                        {logoTab === "suggested" && (
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {logos.map((url) => (
                                    <div
                                        key={url}
                                        className={`border rounded p-1 flex flex-col items-center cursor-pointer ${selected === url
                                                ? "border-blue-500"
                                                : "border-gray-300"
                                            }`}
                                        onClick={() => setSelected(url)}
                                    >
                                        <Image
                                            src={`${url}?tr=w-80,h-80,q-80,fo-auto`}
                                            alt="logo"
                                            width={48}
                                            height={48}
                                            className="object-contain rounded"
                                        />
                                        <span className="text-xs mt-1 truncate w-16 text-center">
                                            {url.split("/").pop()?.split(".")[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* URL Tab */}
                        {logoTab === "url" && (
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="border rounded px-2 py-1 w-full text-sm"
                                    placeholder="https://example.com/logo.png"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-3 py-1 bg-orange-500 rounded-sm"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1 bg-blue-500 rounded"
                                onClick={() => {
                                    const finalUrl = logoTab === "url" ? urlInput : selected;
                                    if (finalUrl) {
                                        onChange(finalUrl);
                                        setShowModal(false);
                                    }
                                }}
                                disabled={!selected && !urlInput}
                            >
                                Select
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
