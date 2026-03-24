import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useLoader } from '../../context/LoaderContext';
import './MiniLoader.css';

const MiniLoader = () => {
  const { showMiniLoader } = useLoader();
  const loaderRef = useRef(null);
  const spinnerRef = useRef(null);
  const prevShowRef = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación cuando aparece
      if (showMiniLoader && !prevShowRef.current) {
        gsap.fromTo(
          loaderRef.current,
          {
            opacity: 0,
            scale: 0.8,
            y: 20
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: 'back.out(1.5)'
          }
        );

        // Rotación continua del spinner
        gsap.to(spinnerRef.current, {
          rotation: 360,
          duration: 1,
          repeat: -1,
          ease: 'none',
          transformOrigin: '50% 50%'
        });
      }
      // Animación cuando desaparece
      else if (!showMiniLoader && prevShowRef.current) {
        gsap.to(loaderRef.current, {
          opacity: 0,
          scale: 0.8,
          y: 20,
          duration: 0.3,
          ease: 'back.in(1.5)'
        });
      }

      prevShowRef.current = showMiniLoader;
    });

    return () => ctx.revert();
  }, [showMiniLoader]);

  if (!showMiniLoader) return null;

  return (
    <div ref={loaderRef} className="mini-loader">
      <div ref={spinnerRef} className="mini-loader__spinner">
        <div className="mini-loader__dot mini-loader__dot--1" />
        <div className="mini-loader__dot mini-loader__dot--2" />
        <div className="mini-loader__dot mini-loader__dot--3" />
      </div>
    </div>
  );
};

export default MiniLoader;