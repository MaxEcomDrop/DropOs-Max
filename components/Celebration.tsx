
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Flame, Star, Award } from 'lucide-react';

export const Celebration: React.FC = () => {
  const [active, setActive] = useState<{ id: number; type: string } | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setActive({ id: Date.now(), type: e.detail.type });
      setTimeout(() => setActive(null), 6000);
    };
    window.addEventListener('trigger-celebration', handler);
    return () => window.removeEventListener('trigger-celebration', handler);
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-xl">
          
          {/* Partículas de Fundo */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
              animate={{ 
                scale: [0, 1, 0], 
                opacity: [0, 1, 0], 
                x: (Math.random() - 0.5) * 800, 
                y: (Math.random() - 0.5) * 800,
                rotate: Math.random() * 360
              }}
              transition={{ duration: 3, ease: "easeOut", delay: i * 0.1 }}
              className="absolute text-[var(--nu-purple)]"
            >
              <Star size={24} fill="currentColor" />
            </motion.div>
          ))}

          {active.type === 'subiu-nivel' && (
            <motion.div
              initial={{ scale: 0.5, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0, filter: 'blur(30px)' }}
              transition={{ type: 'spring', damping: 10, stiffness: 100 }}
              className="relative p-1 bg-gradient-to-br from-[var(--nu-purple)] to-[var(--nu-info)] rounded-[60px] shadow-[0_0_100px_rgba(130,10,209,0.5)]"
            >
              <div className="bg-[#08080A] p-16 rounded-[58px] flex flex-col items-center gap-10 border-4 border-white/5">
                <div className="relative">
                   <motion.div 
                     animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-[-40px] border-2 border-dashed border-[var(--nu-purple)]/30 rounded-full" 
                   />
                   <div className="w-32 h-32 rounded-full bg-[var(--nu-purple)] flex items-center justify-center shadow-[0_0_50px_var(--nu-purple)]">
                      <Award size={64} className="text-white animate-bounce" />
                   </div>
                </div>

                <div className="text-center space-y-4">
                  <h3 className="text-white text-6xl font-black italic uppercase tracking-tighter leading-none">NOVA PATENTE</h3>
                  <p className="text-[var(--nu-success)] font-black uppercase tracking-[0.8em] text-[12px]">UPGRADE DE COMANDO AUTORIZADO</p>
                </div>

                <div className="flex gap-4">
                  {[1,2,3,4,5].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    >
                      <Zap size={24} className="text-yellow-400 fill-current" />
                    </motion.div>
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
