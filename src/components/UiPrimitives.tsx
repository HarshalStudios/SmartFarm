import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Sprout,
} from 'lucide-react';
import { Crop, ToastMessage } from '../types/smartfarm';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    const start = displayValue;
    const end = value;
    if (Math.abs(end - start) < 0.01) {
      setDisplayValue(end);
      return;
    }

    const duration = 360;
    const startTime = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(start + (end - start) * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return (
    <span className={`font-mono-tabular ${className}`}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

interface ToastViewportProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastViewport: React.FC<ToastViewportProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto bg-[#0F291E] text-white border border-[#237A4B] rounded-xl p-4 shadow-lg flex items-start gap-3"
          >
            {toast.type === 'warning' || toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-[#A3E635] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#A3E635] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold tracking-tight text-white">
                {toast.title}
              </div>
              <div className="text-[11px] text-[#C8DFD2] mt-0.5 leading-relaxed">
                {toast.description}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#94B8A5] hover:text-white p-0.5 transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const SkeletonCard: React.FC<{ heightClass?: string }> = ({
  heightClass = 'h-48',
}) => (
  <div
    className={`w-full ${heightClass} rounded-xl bg-[#E8EDE9] animate-pulse border border-[#DCE4DF] p-5 flex flex-col justify-between`}
  >
    <div className="space-y-2.5">
      <div className="h-3.5 w-1/3 bg-[#D4DFD7] rounded" />
      <div className="h-6 w-1/2 bg-[#C8D6CC] rounded" />
    </div>
    <div className="h-20 w-full bg-[#DCE5DF] rounded-lg" />
  </div>
);

const STAGES: Crop['growthStage'][] = [
  'Seedling',
  'Vegetative',
  'Flowering',
  'Fruiting / Grain Fill',
  'Maturation',
];

export const GrowthStageStepper: React.FC<{
  currentStage: Crop['growthStage'];
  progressPct: number;
  compact?: boolean;
}> = ({ currentStage, progressPct, compact = false }) => {
  const activeIdx = Math.max(0, STAGES.indexOf(currentStage));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#0F1E16]">
          Stage: {currentStage}
        </span>
        <span className="font-mono-tabular font-semibold text-[#145A3A]">
          {progressPct}% Cycle Complete
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          return (
            <div key={stage} className="space-y-1">
              <div className="h-2 w-full rounded-sm bg-[#E5EBE6] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: isCompleted ? '100%' : isCurrent ? '70%' : '0%',
                  }}
                  transition={{ duration: 0.35 }}
                  className={`h-full ${
                    isCurrent
                      ? 'bg-[#84CC16]'
                      : isCompleted
                      ? 'bg-[#145A3A]'
                      : 'bg-transparent'
                  }`}
                />
              </div>
              {!compact && (
                <div
                  className={`text-[10px] truncate ${
                    isCurrent
                      ? 'font-bold text-[#145A3A]'
                      : isCompleted
                      ? 'font-medium text-[#4A5D52]'
                      : 'text-[#7A8C81]'
                  }`}
                >
                  {idx + 1}. {stage.split(' ')[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ResilientImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-[#0F4C31] via-[#145A3A] to-[#237A4B] flex flex-col items-center justify-center text-white p-6 text-center ${className}`}
      >
        <Sprout className="w-8 h-8 text-[#A3E635] mb-2" />
        <span className="text-xs font-medium text-[#D8E8DF]">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
