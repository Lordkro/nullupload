interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      {/* Shield */}
      <path
        d="M24 4L6 12v12c0 11 8 18 18 20 10-2 18-9 18-20V12L24 4z"
        fill="#1e293b"
        stroke="#3b82f6"
        strokeWidth="2"
      />
      {/* Upload arrow */}
      <path d="M24 34V18" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M18 24l6-6 6 6"
        stroke="#60a5fa"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cancel slash */}
      <line
        x1="14"
        y1="38"
        x2="34"
        y2="10"
        stroke="#ef4444"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
