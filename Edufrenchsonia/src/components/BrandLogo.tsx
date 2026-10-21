import React from 'react';

/**
 * BrandLogo – Accessible, high-contrast "EduFrench by Sonia" brand block.
 *
 * Props
 *   size      – controls image height/width and text scale
 *   variant   – "dark" (on dark/coloured backgrounds) | "light" (on light backgrounds)
 *   showTagline – whether to render "by Sonia" below the name (default true)
 *   className – extra wrapper class
 */
export type BrandLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type BrandLogoVariant = 'dark' | 'light';

interface BrandLogoProps {
  size?: BrandLogoSize;
  variant?: BrandLogoVariant;
  showTagline?: boolean;
  className?: string;
}

const sizeMap: Record<BrandLogoSize, { img: string; name: string; tagline: string }> = {
  xs:  { img: 'h-9 w-9',    name: 'text-sm',   tagline: 'text-[10px]' },
  sm:  { img: 'h-14 w-14',  name: 'text-lg',   tagline: 'text-xs' },
  md:  { img: 'h-20 w-20',  name: 'text-2xl',  tagline: 'text-sm' },
  lg:  { img: 'h-28 w-28',  name: 'text-3xl',  tagline: 'text-base' },
  xl:  { img: 'h-36 w-36',  name: 'text-4xl',  tagline: 'text-lg' },
};

export default function BrandLogo({
  size = 'md',
  variant = 'dark',
  showTagline = true,
  className = '',
}: BrandLogoProps) {
  const sz = sizeMap[size];

  // Colour sets optimised for AAA contrast on their respective backgrounds
  const colors =
    variant === 'dark'
      ? {
          edu:     '#FFFFFF',   // pure white on dark bg
          french:  '#FFD166',   // warm amber – readable against dark
          tagline: '#FFD166',   // same warm amber for "by Sonia"
          shadow:  'drop-shadow(0 4px 10px rgba(0,0,0,0.55))',
        }
      : {
          edu:     '#1E3A8A',   // navy blue on white/light
          french:  '#B91C1C',   // strong red (French tricolour) on white
          tagline: '#4B5563',   // neutral grey
          shadow:  'drop-shadow(0 3px 8px rgba(0,0,0,0.18))',
        };

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`} role="img" aria-label="EduFrench by Sonia logo">
      {/* Logo image */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className={`${sz.img} object-contain mb-1.5`}
        style={{ filter: colors.shadow }}
      />

      {/* Brand name */}
      <div
        className={`${sz.name} font-black leading-none tracking-tight`}
        style={{ letterSpacing: '-0.02em' }}
      >
        <span style={{ color: colors.edu }}>Edu</span>
        <span style={{ color: colors.french }}>French</span>
      </div>

      {/* Tagline */}
      {showTagline && (
        <div
          className={`${sz.tagline} font-bold mt-0.5`}
          style={{
            color: colors.tagline,
            fontStyle: 'italic',
            letterSpacing: '0.06em',
          }}
        >
          by Sonia
        </div>
      )}
    </div>
  );
}
