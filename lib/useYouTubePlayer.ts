"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    if (!document.getElementById("youtube-iframe-api")) {
      const script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => reject(new Error("Failed to load the YouTube iframe API."));
      document.body.appendChild(script);
    }
  });

  return apiPromise;
}

export type PlayerStatus =
  | "empty"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export function useYouTubePlayer(elementId: string) {
  const playerRef = useRef<any>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<PlayerStatus>("empty");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function createPlayer() {
      try {
        await loadYouTubeApi();
        if (cancelled || playerRef.current) return;

        playerRef.current = new window.YT.Player(elementId, {
          height: "200",
          width: "200",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (!cancelled) {
                console.log(`YouTube player "${elementId}" is ready.`);
              }
            },
            onStateChange: (event: any) => {
              if (cancelled) return;
              const playerState = window.YT.PlayerState;

              if (event.data === playerState.CUED) {
                setStatus("ready");
                setDuration(playerRef.current?.getDuration?.() || 0);
              } else if (event.data === playerState.PLAYING) {
                setStatus("playing");
              } else if (event.data === playerState.PAUSED) {
                setStatus("paused");
              } else if (event.data === playerState.ENDED) {
                setStatus("ended");
                setCurrentTime(0);
              }
            },
            onError: (event: any) => {
              if (cancelled) return;
              console.error(`YouTube player "${elementId}" error:`, event.data);
              setStatus("error");
            },
          },
        });
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setStatus("error");
        }
      }
    }

    createPlayer();

    return () => {
      cancelled = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [elementId]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player?.getCurrentTime) return;

      setCurrentTime(player.getCurrentTime() || 0);
      setDuration(player.getDuration() || 0);
    }, 250);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const load = useCallback((videoId: string) => {
    if (!videoId.trim()) {
      console.error("Cannot load a YouTube video without a video ID.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setCurrentTime(0);
    setDuration(0);

    let attempts = 0;
    const maximumAttempts = 40;

    const tryLoad = () => {
      const player = playerRef.current;

      if (player?.cueVideoById) {
        player.cueVideoById({ videoId, startSeconds: 0 });
        return;
      }

      attempts += 1;
      if (attempts >= maximumAttempts) {
        console.error(`YouTube player "${elementId}" did not become ready.`);
        setStatus("error");
        return;
      }

      retryTimerRef.current = setTimeout(tryLoad, 150);
    };

    tryLoad();
  }, [elementId]);

  const play = useCallback(() => {
    playerRef.current?.playVideo?.();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo?.();
  }, []);

  const seek = useCallback((seconds: number) => {
    if (!Number.isFinite(seconds)) return;
    playerRef.current?.seekTo?.(Math.max(0, seconds), true);
    setCurrentTime(Math.max(0, seconds));
  }, []);

  const stop = useCallback(() => {
    playerRef.current?.stopVideo?.();
    setStatus("empty");
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const toggle = useCallback(() => {
    if (status === "playing") {
      pause();
    } else if (status === "ready" || status === "paused" || status === "ended") {
      play();
    }
  }, [status, play, pause]);

  return { status, currentTime, duration, load, play, pause, seek, stop, toggle };
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}