"use client";

import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { Track } from "@/lib/types";
import { formatTime, useYouTubePlayer } from "@/lib/useYouTubePlayer";
import gsap from "gsap";
import { playInsertBounce, useLid, useSpin } from "@/lib/motion";

export default function CDPlayer({ initialTrack }: { initialTrack?: Track | null }) {
  const { isOver, setNodeRef } = useDroppable({ id: "cd-slot", data: { format: "cd" } });
  const [track, setTrack] = useState<Track | null>(initialTrack ?? null);
  const [lidOpen, setLidOpen] = useState(false);
  const lidRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);

  const { status, currentTime, duration, load, play, pause } = useYouTubePlayer("cd-yt-engine");

  useLid(lidRef as React.RefObject<HTMLElement>, lidOpen);

  useEffect(() => {
    if (!discRef.current) return;
    gsap.to(discRef.current, {
      y: lidOpen ? 6 : 0,
      scale: lidOpen ? 0.96 : 1,
      duration: 0.35,
      ease: "power2.out",
    });
  }, [lidOpen]);

  useEffect(() => {
    if (initialTrack?.format && initialTrack.format === "cd" && initialTrack.id !== track?.id) {
      setTrack(initialTrack);
    }
  }, [initialTrack, track?.id]);

  useDndMonitor({
    onDragStart() {
      setLidOpen(true);
    },
    onDragEnd(event) {
      if (event.over?.id === "cd-slot") {
        const droppedTrack = event.active.data.current?.track as Track | undefined;
        if (droppedTrack?.format === "cd") {
          setTrack(droppedTrack);
        }
      }
      window.setTimeout(() => setLidOpen(false), 350);
    },
    onDragCancel() {
      setLidOpen(false);
    },
  });

  useEffect(() => {
    if (!track?.youtubeId) return;
    load(track.youtubeId);
    playInsertBounce(discRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, load]);

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const hasError = status === "error";

  const handlePlayPause = () => {
    if (!track || isLoading || hasError) return;
    if (isPlaying) pause();
    else play();
  };

  const handleEject = () => {
    pause();
    setTrack(null);
    setLidOpen(true);
    window.setTimeout(() => setLidOpen(false), 350);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        id="cd-yt-engine"
        aria-hidden="true"
        className="pointer-events-none fixed -left-[9999px] top-0 h-[200px] w-[200px]"
      />

      <div
        ref={setNodeRef}
        className={`relative w-72 rounded-xl border-2 p-4 shadow-deck transition-colors ${
          isOver ? "border-amber-500 bg-walnut-700" : "border-black/40 bg-walnut-800"
        }`}
      >
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-paper/50">
          Discman
        </p>

        <div className="relative mx-auto flex h-40 w-full items-center justify-center overflow-hidden rounded-md border border-black/40 bg-walnut-950/80 shadow-inset">
          <div
            ref={discRef}
            className="absolute h-28 w-28 rounded-full border border-black/40"
            style={{
              background: track
                ? `conic-gradient(from 90deg, #dfe6ee, ${track.color}, #dfe6ee, #f3f6fa, ${track.color})`
                : "#241a13",
            }}
          >
            <Disc spinning={isPlaying} />
          </div>

          {/* lid, animated open/closed with GSAP */}
          <div
            ref={lidRef}
            className="absolute inset-0 flex items-start justify-center border-b border-black/40 bg-walnut-900/95"
          >
            <p className="mt-14 font-hand text-base text-paper/40">
              {lidOpen ? "drop the disc" : track ? "disc loaded" : "drag a CD here"}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-md border border-black/40 bg-[#9fae8f] px-3 py-2 shadow-inset">
          <p className="truncate font-mono text-xs uppercase tracking-wide text-walnut-950">
            {track ? track.title : "no disc"}
          </p>
          <div className="mt-0.5 flex items-center justify-between font-mono text-[11px] text-walnut-950/70">
            <span>{track ? track.artist : "—"}</span>
            <span>{track ? `${formatTime(currentTime)} / ${formatTime(duration)}` : "0:00"}</span>
          </div>
          {track && (
            <p className="mt-1 font-mono text-[9px] uppercase tracking-wide text-walnut-950/55">
              {hasError ? "playback error — check the browser console" : isLoading ? "loading..." : status}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={!track || isLoading || hasError}
            aria-label={isPlaying ? "Pause CD" : "Play CD"}
            className="flex h-10 w-16 items-center justify-center rounded-md border border-black/40 bg-amber-500 font-mono text-sm font-bold text-walnut-950 shadow-inset transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:active:translate-y-0"
          >
            {isPlaying ? "❙❙" : "▶"}
          </button>
          <button
            type="button"
            onClick={handleEject}
            disabled={!track}
            className="flex h-10 w-16 items-center justify-center rounded-md border border-black/40 bg-walnut-700 font-mono text-xs uppercase text-paper/70 shadow-inset transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
}

function Disc({ spinning }: { spinning: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useSpin(ref as React.RefObject<HTMLElement>, spinning, 2.2);

  return (
    <div ref={ref} className="absolute inset-0 rounded-full">
      <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-walnut-950" />
    </div>
  );
}
