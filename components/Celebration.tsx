import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Flame } from 'lucide-react';

export const Celebration: React.FC = () => {
  const [active, setActive] = useState<{ id: number; type: string } | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setActive({ id: Date.now(), type: e.detail.type });
      setTimeout(() => setActive(null), 5000);
    };
    window.addEventListener('trigger-celebration', handler);
    return () => window.removeEventListener('trigger-celebration', handler);
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden bg-black/20 backdrop-blur-sm">
          {active.type === 'subiu-nivel' && (
            <motion.div
              initial={{ scale: 0, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="fire-effect p-1 bg-gradient-to-br rounded-[40px]"
            >
              <div className="bg-[var(--bg-card)] p-12 rounded-[38px] flex flex-col items-center gap-6 shadow-2xl">
                <div className="relative">
                  <Flame size={100} className="text-orange-500 animate-pulse" />
                  <Trophy size={60} className="text-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg" />
                </div>
                <div className="text-center">
                  <h3 className="text-[var(--text-main)] text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">NOVO NÍVEL</h3>
                  <p className="text-orange-500 font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px] mt-3">OPERADOR DE ELITE RECONHECIDO</p>
                </div>
                <div className="flex gap-2">
                  {[1,2,3].map(i => (
                    <Zap key={i} size={20} className="text-yellow-400 fill-current animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};