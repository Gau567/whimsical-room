"use client";

import { useEffect, useRef } from "react";

/**
 * Tiny generated room sounds. No audio files are downloaded and there is
 * intentionally no sound on hover: the room only answers after a real click.
 */
export function useRoomSoundEffects(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function getContext() {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return null;

      if (!contextRef.current) {
        contextRef.current = new AudioContextClass();
      }

      if (contextRef.current.state === "suspended") {
        void contextRef.current.resume();
      }

      return contextRef.current;
    }

    function click(frequency = 210, duration = 0.045, volume = 0.035) {
      const context = getContext();
      if (!context) return;

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(80, frequency * 0.62),
        now + duration,
      );

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + duration);
    }

    function drawerThunk() {
      const context = getContext();
      if (!context) return;

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(105, now);
      oscillator.frequency.exponentialRampToValueAtTime(58, now + 0.09);
      gain.gain.setValueAtTime(0.055, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (target.closest(".desk-drawer-button")) {
        drawerThunk();
        return;
      }

      if (target.closest(".shelf-lamp-v7")) {
        click(330, 0.055, 0.03);
        return;
      }

      if (
        target.closest(
          ".room-turntable, .room-cassette-deck, .room-cd-deck, .desk-computer, .room-pinboard, .desk-typewriter-mini, .photo-stack, .shelf-journal, .book-row",
        )
      ) {
        click();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [enabled]);
}
