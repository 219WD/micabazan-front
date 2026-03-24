import { useState, useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";

const AUTOPLAY_INTERVAL = 5000;

/**
 * useHeroCarousel
 *
 * Maneja el estado y las animaciones GSAP del hero carrusel.
 *
 * @param {number} total - cantidad de slides
 * @returns {object} - estado, refs y handlers para el componente
 */
const useHeroCarousel = (total) => {
  const [current, setCurrent]   = useState(0);
  const [animating, setAnimating] = useState(false);

  // Refs de los elementos DOM a animar
  const labelRef = useRef(null);
  const linesRef = useRef([]);   // array de refs por cada línea del título
  const ctaRef   = useRef(null);
  const imgRef   = useRef(null);

  // ─── Animación de entrada ──────────────────────────────────────────────────
  const animateIn = useCallback((dir = 1) => {
    const tl = gsap.timeline({ onComplete: () => setAnimating(false) });

    tl.fromTo(
      imgRef.current,
      { x: dir * 60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
      0
    );

    tl.fromTo(
      labelRef.current,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
      0.1
    );

    linesRef.current.forEach((el, i) => {
      if (!el) return;
      tl.fromTo(
        el,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
        0.15 + i * 0.08
      );
    });

    tl.fromTo(
      ctaRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
      0.4
    );
  }, []);

  // ─── Animación de salida → cambia slide → dispara entrada ─────────────────
  const goTo = useCallback((next, dir = 1) => {
    if (animating) return;
    setAnimating(true);

    const targets = [
      labelRef.current,
      ...linesRef.current.filter(Boolean),
      ctaRef.current,
    ];

    const tl = gsap.timeline({
      onComplete: () => setCurrent(next),
    });

    tl.to(targets, {
      y: dir * -20,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      stagger: 0.04,
    }, 0);

    tl.to(imgRef.current, {
      x: dir * -40,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
    }, 0);
  }, [animating]);

  // Cuando cambia el slide → animación de entrada
  useEffect(() => {
    animateIn(1);
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Navegación ────────────────────────────────────────────────────────────
  const prev = useCallback(() => {
    goTo((current - 1 + total) % total, -1);
  }, [current, total, goTo]);

  const next = useCallback(() => {
    goTo((current + 1) % total, 1);
  }, [current, total, goTo]);

  const goToIndex = useCallback((index) => {
    if (index === current) return;
    goTo(index, index > current ? 1 : -1);
  }, [current, goTo]);

  // ─── Autoplay ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      if (!animating) next();
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next, animating]);

  return {
    current,
    animating,
    prev,
    next,
    goToIndex,
    refs: { labelRef, linesRef, ctaRef, imgRef },
  };
};

export default useHeroCarousel;