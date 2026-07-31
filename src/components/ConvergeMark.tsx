"use client";

export default function ConvergeMark({
  size = 72,
  animate = true,
}: {
  size?: number;
  animate?: boolean;
}) {
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label="Converge logo"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="overflow-visible"
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <g className={animate ? "converge-orbit" : ""}>
          <circle cx="50" cy="18" r="7" fill="var(--primary)" />
        </g>
        <g className={animate ? "converge-orbit converge-orbit-2" : ""}>
          <circle cx="50" cy="18" r="7" fill="var(--primary-soft)" />
        </g>
        <g className={animate ? "converge-orbit converge-orbit-3" : ""}>
          <circle cx="50" cy="18" r="7" fill="var(--accent-mint)" />
        </g>
        <circle
          cx="50"
          cy="50"
          r="9"
          fill="var(--foreground)"
          className={animate ? "converge-core" : ""}
        />
      </svg>
      <style>{`
        .converge-orbit {
          transform-origin: 50px 50px;
          animation: orbit 2.4s ease-in-out infinite;
        }
        .converge-orbit-2 { animation-delay: 0.15s; }
        .converge-orbit-3 { animation-delay: 0.3s; }
        .converge-core {
          animation: pulse 2.4s ease-in-out infinite;
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) scale(1); opacity: 1; }
          50% { transform: rotate(180deg) scale(0.4); opacity: 0.6; }
          100% { transform: rotate(360deg) scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { r: 9; opacity: 0.9; }
          50% { r: 12; opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .converge-orbit, .converge-core { animation: none; }
        }
      `}</style>
    </div>
  );
}
