import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CoherenceMeterProps {
  coherence: number; // -1 to 1
  className?: string;
}

export function CoherenceMeter({ coherence, className = '' }: CoherenceMeterProps) {
  const [displayValue, setDisplayValue] = useState(coherence);

  useEffect(() => {
    // Smooth transition to new value
    setDisplayValue(coherence);
  }, [coherence]);

  // Map coherence (-1 to 1) to percentage (0 to 100)
  const percentage = ((displayValue + 1) / 2) * 100;

  // Determine color based on coherence
  const getColor = () => {
    if (displayValue > 0.8) return 'from-green-500 to-emerald-400';
    if (displayValue > 0.5) return 'from-lime-500 to-green-400';
    if (displayValue > 0.0) return 'from-yellow-500 to-amber-400';
    if (displayValue > -0.5) return 'from-orange-500 to-yellow-400';
    return 'from-red-500 to-orange-400';
  };

  const getLabel = () => {
    if (displayValue > 0.8) return 'COHERENT';
    if (displayValue > 0.5) return 'ALIGNED';
    if (displayValue > 0.0) return 'TRANSITIONAL';
    if (displayValue > -0.5) return 'UNCERTAIN';
    return 'DECOHERENT';
  };

  const getTextColor = () => {
    if (displayValue > 0.8) return 'text-green-400';
    if (displayValue > 0.5) return 'text-lime-400';
    if (displayValue > 0.0) return 'text-yellow-400';
    if (displayValue > -0.5) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label and Value */}
      <div className="flex justify-between items-center">
        <span className={`text-lg font-bold tracking-wider ${getTextColor()}`}>
          {getLabel()}
        </span>
        <span className="text-sm text-muted-foreground">
          {displayValue.toFixed(3)}
        </span>
      </div>

      {/* Meter Container */}
      <div className="relative h-8 bg-secondary/30 rounded-full overflow-hidden border border-border">
        {/* Animated Fill */}
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getColor()} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.8,
            ease: 'easeOut'
          }}
        />

        {/* Glow Effect */}
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getColor()} opacity-50 blur-md`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.8,
            ease: 'easeOut'
          }}
        />

        {/* Center Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />

        {/* Percentage Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono text-foreground/80 mix-blend-difference">
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Scale Markers */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>-1.0</span>
        <span>0.0</span>
        <span>+1.0</span>
      </div>
    </div>
  );
}
