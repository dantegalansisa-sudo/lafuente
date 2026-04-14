import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isDesktop, setIsDesktop] = useState(false);

  const springConfig = { damping: 25, stiffness: 250 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    if (window.innerWidth <= 768) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 5);
      cursorY.set(e.clientY - 5);
    };

    const ring = document.getElementById('cursor-ring');

    const handleHoverIn = () => {
      ring?.classList.add('cursor--hover');
    };
    const handleHoverOut = () => {
      ring?.classList.remove('cursor--hover');
    };

    window.addEventListener('mousemove', moveCursor);

    const bindInteractives = () => {
      const interactives = document.querySelectorAll('a, button, .product-card, .category-circle, .filter-chip, .cat-navbar-item');
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverIn);
        el.removeEventListener('mouseleave', handleHoverOut);
        el.addEventListener('mouseenter', handleHoverIn);
        el.addEventListener('mouseleave', handleHoverOut);
      });
    };

    const observer = new MutationObserver(bindInteractives);
    observer.observe(document.body, { childList: true, subtree: true });
    bindInteractives();

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('resize', checkDesktop);
      observer.disconnect();
    };
  }, [cursorX, cursorY]);

  if (!isDesktop) return null;

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{ x: cursorX, y: cursorY }}
      />
      <motion.div
        id="cursor-ring"
        className="cursor-ring"
        style={{ x: springX, y: springY }}
      />
    </>
  );
}
