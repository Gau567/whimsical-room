"use client";

import { useEffect, useRef, RefObject } from "react";
import gsap from "gsap";

/**
 * Spins an element continuously while `spinning` is true, ramping the
 * rotation speed up and down instead of snapping instantly — so reels
 * and discs feel like they have mass (a motor winding up / coasting to
 * a stop) rather than a CSS class toggling on and off.
 */
export function useSpin(ref: RefObject<HTMLElement>, spinning: boolean, revolutionSeconds = 1.3) {
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!ref.current || tweenRef.current) return;
    tweenRef.current = gsap.to(ref.current, {
      rotation: "+=360",
      duration: revolutionSeconds,
      ease: "none",
      repeat: -1,
      paused: true,
    });
    return () => {
      tweenRef.current?.kill();
      tweenRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  useEffect(() => {
    const tween = tweenRef.current;
    if (!tween) return;
    if (spinning) {
      tween.timeScale(0);
      tween.play();
      gsap.to(tween, { timeScale: 1, duration: 0.5, ease: "power2.out" });
    } else {
      gsap.to(tween, {
        timeScale: 0,
        duration: 0.7,
        ease: "power2.in",
        onComplete: () => tween.pause(),
      });
    }
  }, [spinning]);
}

/** Cassette / CD dropping into place, with a little overshoot settle. */
export function playInsertBounce(el: HTMLElement | null) {
  if (!el) return;
  gsap.fromTo(
    el,
    { y: -36, opacity: 0, scale: 0.92, rotate: -2 },
    { y: 0, opacity: 1, scale: 1, rotate: 0, duration: 0.55, ease: "back.out(1.8)" }
  );
}

/** Animates an element out before the caller unmounts / clears it. */
export function playEjectOut(el: HTMLElement | null, onComplete: () => void) {
  if (!el) {
    onComplete();
    return;
  }
  gsap.to(el, {
    y: -28,
    opacity: 0,
    scale: 0.94,
    duration: 0.28,
    ease: "power2.in",
    onComplete,
  });
}

/** Opens with a quick push, closes with a little overshoot "click." */
export function useLid(ref: RefObject<HTMLElement>, open: boolean) {
  useEffect(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      scaleY: open ? 0.15 : 1,
      duration: open ? 0.32 : 0.45,
      ease: open ? "power3.out" : "back.in(1.5)",
      transformOrigin: "top",
    });
  }, [ref, open]);
}
