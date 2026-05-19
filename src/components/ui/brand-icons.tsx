// Official brand SVG icons for gift cards

export function AmazonIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="8" fill="#131921"/>
      <text x="24" y="27" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" fill="white">amazon</text>
      {/* Orange smile arrow from 'a' to 'z' */}
      <path d="M15 31.5 Q24 37.5 33 31.5" stroke="#FF9900" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M30.5 29 L33 31.5 L30.5 34" stroke="#FF9900" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function NetflixIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="8" fill="#000000"/>
      {/* Netflix N: two vertical bars connected by diagonal stroke */}
      <path d="M13 10 L19 10 L29 38 L35 38 L35 10 L29 10 L19 38 L13 38 Z" fill="#E50914"/>
    </svg>
  );
}

export function SteamIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="steamBg" cx="40%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#4a7fa5"/>
          <stop offset="100%" stopColor="#1B2838"/>
        </radialGradient>
      </defs>
      <rect width="48" height="48" rx="8" fill="url(#steamBg)"/>
      {/* Steam S-pipe logo: two pipe joints connected by a curve */}
      <circle cx="29" cy="17" r="6.5" stroke="#C6D4DF" strokeWidth="3.5" fill="none"/>
      <circle cx="29" cy="17" r="3" fill="#C6D4DF"/>
      <path d="M22.5 17 Q14 17 14 25 Q14 33 21.5 33" stroke="#C6D4DF" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <circle cx="19" cy="31" r="6.5" stroke="#C6D4DF" strokeWidth="3.5" fill="none"/>
      <circle cx="19" cy="31" r="3" fill="#C6D4DF"/>
    </svg>
  );
}

export function AppleIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="8" fill="#F5F5F7"/>
      <path
        d="M32 25.5c-.05-4.15 3.39-6.15 3.54-6.25-1.93-2.82-4.93-3.21-5.99-3.25-2.56-.26-5.01 1.51-6.31 1.51-1.3 0-3.3-1.48-5.43-1.44-2.79.04-5.37 1.63-6.81 4.12-2.91 5.05-.75 12.52 2.09 16.62 1.39 2.01 3.05 4.26 5.21 4.18 2.09-.08 2.88-1.35 5.41-1.35 2.53 0 3.26 1.35 5.47 1.31 2.25-.04 3.69-2.04 5.07-4.06a18.4 18.4 0 0 0 2.31-4.64C36.34 32.24 32.05 30.5 32 25.5z"
        fill="#1D1D1F"
      />
      <path
        d="M28.24 13.5c1.15-1.4 1.93-3.33 1.72-5.25-1.66.07-3.68 1.1-4.87 2.48-1.07 1.23-2 3.2-1.75 5.09 1.85.14 3.75-.94 4.9-2.32z"
        fill="#1D1D1F"
      />
    </svg>
  );
}

export function GooglePlayIcon({ className = "w-12 h-12" }: { className?: string }) {
  // Division point at ~(21, 24); top/bottom edge intersections at (21, 14) and (21, 34)
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="8" fill="white" stroke="#E8E8E8" strokeWidth="0.5"/>
      {/* Blue: top-left quadrilateral */}
      <path d="M12 9 L12 24 L21 24 L21 14 Z" fill="#4285F4"/>
      {/* Green: top-right with rounded right tip */}
      <path d="M21 14 C32 14 38 18.5 38 24 L21 24 Z" fill="#34A853"/>
      {/* Red: bottom-left quadrilateral */}
      <path d="M12 24 L12 39 L21 34 L21 24 Z" fill="#EA4335"/>
      {/* Yellow/gold: bottom-right with rounded right tip */}
      <path d="M21 24 L21 34 C32 34 38 29.5 38 24 Z" fill="#FBBC04"/>
    </svg>
  );
}

export function PlayStationIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="psBg" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#0070D1"/>
          <stop offset="100%" stopColor="#00439C"/>
        </radialGradient>
      </defs>
      <rect width="48" height="48" rx="8" fill="url(#psBg)"/>
      {/* PlayStation overlapping P and S logo */}
      {/* P: tall vertical bar */}
      <rect x="13" y="13" width="5" height="24" rx="2.5" fill="white"/>
      {/* P: bowl (semicircle at top of bar) */}
      <path d="M18 13 Q28 13 28 19.5 Q28 26 18 26 L18 13 Z" fill="white"/>
      {/* S: two arcs overlapping with P */}
      <path
        d="M24 20 C24 20 34 18 34 23 C34 27 26 27 26 31 C26 35 34 34 36 33"
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function XboxIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="8" fill="#107C10"/>
      {/* White sphere */}
      <circle cx="24" cy="24" r="16" fill="white"/>
      {/* Xbox X: four curved green petals meeting at center */}
      <path d="M24 24 C21 21 16 17 15 14 C17 12 21 15 24 21 C27 15 31 12 33 14 C32 17 27 21 24 24 Z" fill="#107C10"/>
      <path d="M24 24 C21 27 16 31 15 34 C17 36 21 33 24 27 C27 33 31 36 33 34 C32 31 27 27 24 24 Z" fill="#107C10"/>
    </svg>
  );
}

export function SpotifyIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="8" fill="#000000"/>
      {/* Large green circle */}
      <circle cx="24" cy="24" r="19" fill="#1DB954"/>
      {/* Three thick black sound wave arcs */}
      <path d="M12 18.5 Q24 12 36 18.5" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M14 24.5 Q24 19.5 34 24.5" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      <path d="M16.5 30.5 Q24 27 31.5 30.5" stroke="black" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function ITunesIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="itunesRing" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FC3C44"/>
          <stop offset="45%" stopColor="#9B26AF"/>
          <stop offset="100%" stopColor="#2D55D0"/>
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="8" fill="white"/>
      {/* Colorful gradient ring */}
      <circle cx="24" cy="24" r="17" stroke="url(#itunesRing)" strokeWidth="8" fill="white"/>
      {/* Double eighth note (beamed quavers) */}
      {/* Note heads */}
      <ellipse cx="18" cy="31" rx="3.5" ry="2.5" fill="#1D1D1F"/>
      <ellipse cx="27" cy="29" rx="3.5" ry="2.5" fill="#1D1D1F"/>
      {/* Stems */}
      <line x1="21.5" y1="31" x2="21.5" y2="19.5" stroke="#1D1D1F" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="30.5" y1="29" x2="30.5" y2="17.5" stroke="#1D1D1F" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Beams */}
      <line x1="21.5" y1="19.5" x2="30.5" y2="17.5" stroke="#1D1D1F" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="21.5" y1="22" x2="30.5" y2="20" stroke="#1D1D1F" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}
