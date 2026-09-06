"use client";

import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { Track } from "@/lib/types";
import { formatTime } from "@/lib/useYouTubePlayer";
import { useMusicPlayer } from "@/lib/MusicPlayerContext";
import { useSpin, playInsertBounce, playEjectOut } from "@/lib/motion";

export default function CassettePlayer({ initialTrack }: { initialTrack?: Track | null }) {
  const { isOver, setNodeRef } = useDroppable({ id: "cassette-slot", data: { format: "cassette" } });
  const [ejecting, setEjecting] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const {
    currentTrack,
    status,
    currentTime,
    duration,
    isPlaying,
    loadTrack,
    play,
    pause,
    eject,
  } = useMusicPlayer();

  const track = currentTrack?.format === "cassette" ? currentTrack : null;

  useEffect(() => {
    if (!initialTrack || initialTrack.format !== "cassette") return;
    if (currentTrack?.id === initialTrack.id) return;
    loadTrack(initialTrack);
    playInsertBounce(bodyRef.current);
  }, [initialTrack, currentTrack?.id, loadTrack]);

  useDndMonitor({
    onDragEnd(event) {
      if (event.over?.id !== "cassette-slot") return;
      const dropped = event.active.data.current?.track as Track | undefined;
      if (dropped?.format === "cassette") {
        loadTrack(dropped);
        playInsertBounce(bodyRef.current);
      }
    },
  });

  const isLoading = status === "loading";
  const hasError = status === "error";

  const handleEject = () => {
    if (!track || ejecting) return;
    pause();
    setEjecting(true);
    playEjectOut(bodyRef.current, () => {
      eject();
      setEjecting(false);
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={setNodeRef}
        className={`relative w-72 rounded-xl border-2 p-4 shadow-deck transition-colors ${
          isOver ? "border-amber-500 bg-walnut-700" : "border-black/40 bg-walnut-800"
        }`}
      >
        <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-paper/50">
          Walkman
        </p>

        <div className="relative mx-auto flex h-28 w-full items-center justify-center overflow-hidden rounded-md border border-black/40 bg-walnut-950/80 shadow-inset">
          {!track ? (
            <p className="px-6 text-center font-hand text-base text-paper/40">drag a tape in</p>
          ) : (
            <div
              ref={bodyRef}
              className="flex w-56 items-center justify-between rounded-sm border border-black/40 px-4 py-3"
              style={{ backgroundColor: track.color }}
            >
              <Reel spinning={isPlaying && !ejecting} />
              <div className="px-2 text-center">
                <p className="font-mono text-[10px] uppercase leading-tight text-walnut-950">
                  {track.title}
                </p>
              </div>
              <Reel spinning={isPlaying && !ejecting} />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between px-1">
          <p className="max-w-[65%] truncate font-hand text-lg text-cream">
            {track ? track.artist : "—"}
          </p>
          <p className="font-mono text-xs text-paper/60">
            {track ? `${formatTime(currentTime)} / ${formatTime(duration)}` : "0:00"}
          </p>
        </div>
        {track && (
          <p className="mt-0.5 px-1 font-mono text-[9px] uppercase tracking-wide text-paper/40">
            {hasError ? "playback error — check the browser console" : isLoading ? "loading..." : status}
          </p>
        )}

        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => (isPlaying ? pause() : play())}
            disabled={!track || isLoading || hasError}
            aria-label={isPlaying ? "Pause tape" : "Play tape"}
            className="flex h-10 w-16 items-center justify-center rounded-md border border-black/40 bg-amber-500 font-mono text-sm font-bold text-walnut-950 shadow-inset transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:active:translate-y-0"
          >
            {isPlaying ? "❙❙" : "▶"}
          </button>
          <button
            type="button"
            onClick={handleEject}
            disabled={!track || ejecting}
            className="flex h-10 w-16 items-center justify-center rounded-md border border-black/40 bg-walnut-700 font-mono text-xs uppercase text-paper/70 shadow-inset transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Eject
          </button>
        </div>
      </div>
    </div>
  );
}

function Reel({ spinning }: { spinning: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useSpin(ref as React.RefObject<HTMLElement>, spinning, 1.6);

  return (
    <div ref={ref} className="relative h-7 w-7 rounded-full border-2 border-walnut-950/70 bg-walnut-900/40">
      <div className="m-auto mt-2 h-2.5 w-2.5 rounded-full bg-walnut-950/80" />
    </div>
  );
}
