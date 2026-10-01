import React from 'react';

interface NexusLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
  onClick?: () => void;
}

export const NexusLogo: React.FC<NexusLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
  theme = 'dark',
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl font-bold tracking-tight',
    xl: 'text-4xl font-extrabold tracking-tight',
  };

  const subtitleSizes = {
    sm: 'text-[7px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''} ${className}`}
    >
      {/* 3D Geometric Folded 'N' Glyph matching user logo */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(37,99,235,0.45)]"
        >
          <defs>
            <linearGradient id="nexus-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="nexus-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="60%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="nexus-grad-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Left Vertical / Angled Segment */}
          <path
            d="M20 84V26L38 16V68L20 84Z"
            fill="url(#nexus-grad-1)"
          />

          {/* Diagonal Bridge Folding 3D */}
          <path
            d="M38 16L78 68V84L20 26L38 16Z"
            fill="url(#nexus-grad-2)"
          />

          {/* Right Pillar */}
          <path
            d="M62 32L80 16V74L62 84V32Z"
            fill="url(#nexus-grad-1)"
          />

          {/* Subtle Chamfer Highlight */}
          <path
            d="M38 16L42 19L78 68L80 65L40 15L38 16Z"
            fill="url(#nexus-grad-bevel)"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-['Syne',sans-serif] flex items-baseline gap-1.5 ${titleSizes[size]}`}>
          <span className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} tracking-wider font-extrabold`}>NEXUS</span>
          <span className="text-[#0284c7] font-black drop-shadow-[0_0_8px_rgba(2,132,199,0.3)]">BIM</span>
        </div>
        {showSubtitle && (
          <span className={`${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} font-medium tracking-[0.22em] uppercase mt-1 ${subtitleSizes[size]}`}>
            The marketplace for digital products
          </span>
        )}
      </div>
    </div>
  );
};
