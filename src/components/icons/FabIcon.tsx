/**
 * Ícone estilizado da Força Aérea Brasileira.
 * Inspirado no símbolo oficial da FAB: estrela central circundada por 
 * coroa de louros e enquadrada por asas abertas — adaptado para uso como ícone SVG.
 */
export function FabIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Força Aérea Brasileira"
    >
      {/* Outer ring */}
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />

      {/* Wing left */}
      <path
        d="M4 32 C8 20, 18 16, 32 16"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        fill="none"
      />
      {/* Wing left detail */}
      <path
        d="M6 36 C10 26, 19 22, 32 22"
        stroke="currentColor" strokeWidth="1" strokeLinecap="round"
        fill="none" opacity="0.6"
      />

      {/* Wing right */}
      <path
        d="M60 32 C56 20, 46 16, 32 16"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        fill="none"
      />
      {/* Wing right detail */}
      <path
        d="M58 36 C54 26, 45 22, 32 22"
        stroke="currentColor" strokeWidth="1" strokeLinecap="round"
        fill="none" opacity="0.6"
      />

      {/* Center 5-pointed star */}
      <polygon
        points="32,20 34.9,28.1 43.5,28.1 36.8,33.3 39.3,41.5 32,36.7 24.7,41.5 27.2,33.3 20.5,28.1 29.1,28.1"
        fill="currentColor"
        opacity="0.9"
      />

      {/* Bottom laurel hint */}
      <path
        d="M20 44 Q32 50 44 44"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        fill="none" opacity="0.6"
      />
      <path
        d="M22 47 Q32 53 42 47"
        stroke="currentColor" strokeWidth="1" strokeLinecap="round"
        fill="none" opacity="0.4"
      />
    </svg>
  );
}
