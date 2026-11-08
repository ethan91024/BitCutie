interface MysteryEggProps {
  size?: number;
  className?: string;
}

/** A crisp 16-bit placeholder used until the player creates or chooses a pet. */
export function MysteryEgg({ size = 112, className = "" }: MysteryEggProps) {
  return (
    <svg
      className={`mystery-egg ${className}`}
      width={size}
      height={size * 1.2}
      viewBox="0 0 64 76"
      role="img"
      aria-label="灰色像素蛋，裡面有問號"
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
    >
      <ellipse cx="32" cy="69" rx="17" ry="3" fill="#30343c" opacity="0.13" />
      <g stroke="#333840" strokeWidth="4" strokeLinejoin="miter">
        <path fill="#858b95" d="M30 6h8v4h6v4h4v6h4v7h4v16h-4v8h-4v6h-6v4H22v-4h-6v-6h-4v-8H8V27h4v-7h4v-6h6v-4h8z" />
      </g>
      <path fill="#c5cad1" d="M30 10h8v4h6v4h4v7h4v14h-4v8h-4v6h-6v4H24v-4h-6v-6h-4v-8h-4V27h4v-7h4v-6h6v-4h6z" />
      <path fill="#e0e3e7" d="M28 14h8v4h-8zm-6 4h6v4h-6zm-4 6h4v6h-4zm-4 8h4v9h-4z" />
      <path fill="#a9afb8" d="M44 22h4v5h4v14h-4v8h-4v6h-6v4h-9v-4h9v-4h6v-6h4v-8h4v-8h-4v-3h-4z" />
      <path fill="#393e46" d="M28 27h12v4h4v5h-4v4h-4v5h-4v4h-6v-6h4v-5h4v-4h4v-3H28z" />
      <path fill="#393e46" d="M29 50h7v6h-7z" />
      <path fill="#f0f1f2" d="M22 22h5v4h-5z" opacity="0.9" />
      <path fill="#747b85" d="M19 52h5v4h6v4h-8v-4h-3z" />
      <path fill="#a5abb4" d="M43 16h4v4h-4z" />
      <path fill="#d4d8de" d="M37 60h7v-4h4v-4h4v-6h4v8h-4v6h-6v4H31v-4z" />
    </svg>
  );
}
