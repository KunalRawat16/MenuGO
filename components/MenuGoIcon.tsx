import React from 'react';

interface MenuGoIconProps {
  size?: number;
  className?: string;
  fillColor?: string;
}

export default function MenuGoIcon({ size = 24, className = "", fillColor = "currentColor" }: MenuGoIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Plate Circle */}
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="2.25" 
      />
      
      {/* Left Fork (Menu) */}
      <path 
        d="M8 6.5v3.5a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1V6.5" 
        stroke="currentColor" 
        strokeWidth="1.75" 
        strokeLinecap="round"
      />
      <path 
        d="M9 11v6.5" 
        stroke="currentColor" 
        strokeWidth="1.75" 
        strokeLinecap="round"
      />
      <path 
        d="M9.01 6.5v2.5" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />

      {/* Right Play Arrow (Go) */}
      <path 
        d="M13.5 8.25l5 3.75-5 3.75V8.25z" 
        fill={fillColor}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
