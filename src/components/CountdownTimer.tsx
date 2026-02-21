
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  deadline: number;
  onExpire?: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline, onExpire, className = "" }) => {
  const [msLeft, setMsLeft] = useState(deadline - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        setMsLeft(0);
        clearInterval(timer);
        if (onExpire) onExpire();
      } else {
        setMsLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline, onExpire]);

  if (msLeft <= 0) return <span className="text-emerald-500 font-black uppercase text-[10px]">Activated</span>;

  const hours = Math.floor(msLeft / (1000 * 60 * 60));
  const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((msLeft % (1000 * 60)) / 1000);

  let colorClass = "text-emerald-500"; // > 48h
  if (hours < 24) colorClass = "text-rose-500"; // < 24h
  else if (hours < 48) colorClass = "text-amber-500"; // 24-48h

  return (
    <div className={`font-black tabular-nums tracking-tighter ${colorClass} ${className}`}>
      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};
