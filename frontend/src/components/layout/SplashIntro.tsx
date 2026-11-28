import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Store } from 'lucide-react';

interface SplashIntroProps {
  onComplete?: () => void;
}

export function SplashIntro({ onComplete }: SplashIntroProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 950);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="retail-splash"
          initial={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
          exit={{
            clipPath: 'inset(0% 0% 100% 0%)',
            transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06122B] overflow-hidden select-none pointer-events-auto"
        >
          {/* Animated ambient radial spotlight */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: [0.8, 1.15, 1.02], opacity: [0, 0.9, 0.75] }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute w-[560px] h-[560px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.42)_0%,rgba(37,99,235,0.16)_38%,transparent_70%)] blur-2xl"
          />

          {/* Subtle glowing ring */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.4, opacity: [0, 0.35, 0] }}
            transition={{ duration: 0.95, ease: 'easeOut' }}
            className="pointer-events-none absolute w-[220px] h-[220px] rounded-full border border-[#60A5FA]/40"
          />

          {/* Centered Brand Mark */}
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.65, opacity: 0, y: 14, filter: 'blur(8px)' }}
              animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ scale: 0.9, opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-[56px] h-[56px] rounded-[16px] bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] text-white flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.7),inset_0_1px_0_rgba(255,255,255,0.4)]"
            >
              <Store className="w-7 h-7" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10, letterSpacing: '0.18em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.08em' }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.18, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-[16px] font-bold text-white tracking-wider"
            >
              RETAIL WORKSPACE
            </motion.p>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 w-[120px] h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-[#60A5FA] to-transparent origin-center"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
