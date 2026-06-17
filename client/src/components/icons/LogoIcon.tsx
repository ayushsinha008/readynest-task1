export default function LogoIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a3c2a" />
          <stop offset="100%" stopColor="#2d6a4f" />
        </linearGradient>
        <linearGradient id="logo-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#52b788" />
          <stop offset="100%" stopColor="#95d5b2" />
        </linearGradient>
      </defs>

      {/* Vertical Stem - Represents structure/sidebar */}
      <rect x="6" y="6" width="8" height="28" rx="4" fill="url(#logo-primary)" />
      
      {/* Top Bar - Represents text input */}
      <rect x="16" y="6" width="18" height="8" rx="4" fill="url(#logo-secondary)" />
      
      {/* Middle Bar - Represents short input */}
      <rect x="16" y="16" width="10" height="8" rx="4" fill="url(#logo-secondary)" />
      
      {/* Accent Dot - Represents radio/checkbox */}
      <circle cx="31" cy="20" r="3" fill="url(#logo-primary)" />
    </svg>
  );
}
