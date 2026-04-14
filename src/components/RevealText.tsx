import { motion } from 'framer-motion';

interface RevealTextProps {
  children: string;
  className?: string;
  delay?: number;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  animateOnMount?: boolean;
}

const PREMIUM_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

export default function RevealText({
  children,
  className = '',
  delay = 0,
  tag: Tag = 'h1',
  animateOnMount = false,
}: RevealTextProps) {
  const words = children.split(' ');

  const animationProps = animateOnMount
    ? {
        initial: { y: '110%', rotate: 2, opacity: 0 } as const,
        animate: { y: 0, rotate: 0, opacity: 1 } as const,
      }
    : {
        initial: { y: '110%', rotate: 2, opacity: 0 } as const,
        whileInView: { y: 0, rotate: 0, opacity: 1 } as const,
        viewport: { once: true, amount: 0.3 },
      };

  return (
    <Tag className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', justifyContent: 'inherit' }}>
      {words.map((word, i) => (
        <span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            {...animationProps}
            transition={{
              duration: 0.85,
              delay: delay + i * 0.07,
              ease: PREMIUM_EASE,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
