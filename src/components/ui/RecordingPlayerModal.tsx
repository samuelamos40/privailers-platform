"use client";

import React from "react";

interface RecordingPlayerModalProps {
    title: string;
    url: string;
    onClose: () => void;
}

function getEmbedInfo(rawUrl: string): { type: "video" | "iframe"; src: string } {
    const trimmed = rawUrl.trim();

    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(trimmed)) {
        return { type: "video", src: trimmed };
    }

    try {
        const parsed = new URL(trimmed);
        const host = parsed.hostname.toLowerCase();

        // YouTube (youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...)
        if (host.includes("youtube.com") || host.includes("youtu.be")) {
            let videoId = "";
            if (host.includes("youtu.be")) {
                videoId = parsed.pathname.replace("/", "").split("/")[0];
            } else if (parsed.pathname.startsWith("/embed/")) {
                videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
            } else if (parsed.pathname.startsWith("/shorts/")) {
                videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
            } else {
                videoId = parsed.searchParams.get("v") || "";
            }
            if (videoId) {
                return { type: "iframe", src: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` };
            }
        }

        // Google Drive (/file/d/<id>/view -> /file/d/<id>/preview)
        if (host.includes("drive.google.com")) {
            const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
            if (match?.[1]) {
                return { type: "iframe", src: `https://drive.google.com/file/d/${match[1]}/preview` };
            }
            const idParam = parsed.searchParams.get("id");
            if (idParam) {
                return { type: "iframe", src: `https://drive.google.com/file/d/${idParam}/preview` };
            }
        }

        // Loom (loom.com/share/<id> -> loom.com/embed/<id>)
        if (host.includes("loom.com") && parsed.pathname.includes("/share/")) {
            const loomId = parsed.pathname.split("/share/")[1]?.split("/")[0];
            if (loomId) {
                return { type: "iframe", src: `https://www.loom.com/embed/${loomId}` };
            }
        }

        // Vimeo (vimeo.com/<id> -> player.vimeo.com/video/<id>)
        if (host.includes("vimeo.com") && !host.includes("player.vimeo.com")) {
            const vimeoId = parsed.pathname.replace("/", "").split("/")[0];
            if (vimeoId && /^\d+$/.test(vimeoId)) {
                return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoId}` };
            }
        }
    } catch {
        // Fallback to iframe directly
    }

    return { type: "iframe", src: trimmed };
}

export default function RecordingPlayerModal({ title, url, onClose }: RecordingPlayerModalProps) {
    const embed = getEmbedInfo(url);

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                backdropFilter: "blur(4px)"
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: "960px",
                    backgroundColor: "#0f172a",
                    borderRadius: "1rem",
                    overflow: "hidden",
                    border: "1px solid #334155",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem 1.25rem",
                        backgroundColor: "#1e293b",
                        borderBottom: "1px solid #334155",
                        gap: "1rem"
                    }}
                >
                    <div style={{ color: "white", fontWeight: 700, fontSize: "1.05rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        🎥 {title}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            padding: "0.4rem 0.85rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            whiteSpace: "nowrap"
                        }}
                    >
                        ✕ Close
                    </button>
                </div>

                <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", backgroundColor: "black" }}>
                    {embed.type === "video" ? (
                        <video
                            src={embed.src}
                            controls
                            autoPlay
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                        />
                    ) : (
                        <iframe
                            src={embed.src}
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
