'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function LuxuryCursor() {
  const [isTouch, setIsTouch] = useState(true);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, { stiffness: 160, damping: 18, mass: 0.3 });
  const springY = useSpring(mouseY, { stiffness: 160, damping: 18, mass: 0.3 });

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setIsTouch(false);

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      setHovered(!!(e.target as HTMLElement).closest('a, button'));
    };

    document.body.style.cursor = 'none';
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);

    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
    };
  }, [mouseX, mouseY]);

  if (isTouch) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        zIndex: 99998,
        pointerEvents: 'none',
        borderRadius: '50%',
        border: '1.5px solid rgba(200,164,93,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      animate={{
        width: hovered ? 42 : 18,
        height: hovered ? 42 : 18,
        backgroundColor: hovered ? 'rgba(200,164,93,0.08)' : 'rgba(200,164,93,0)',
      }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {!hovered && (
        <div
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: '#C8A45D',
            flexShrink: 0,
          }}
        />
      )}
    </motion.div>
  );
}
