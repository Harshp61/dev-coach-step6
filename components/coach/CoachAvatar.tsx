'use client'

export type AvatarMood = 'idle' | 'alert' | 'speaking' | 'success'

interface CoachAvatarProps {
  mood: AvatarMood
  size?: number
  pulsing?: boolean
}

export default function CoachAvatar({ mood, size = 56, pulsing }: CoachAvatarProps) {
  const ringColor =
    mood === 'alert'
      ? 'ring-red-400/50'
      : mood === 'speaking'
        ? 'ring-blue-400/60'
        : mood === 'success'
          ? 'ring-emerald-400/50'
          : 'ring-blue-500/30'

  return (
    <div
      className={`relative rounded-2xl ring-2 ${ringColor} shadow-xl shadow-black/40 transition-all duration-300`}
      style={{ width: size, height: size }}
    >
      {pulsing && mood === 'alert' && (
        <span className="absolute inset-0 rounded-2xl bg-red-400/20 animate-ping" />
      )}

      <svg
        viewBox="0 0 64 64"
        className="w-full h-full rounded-2xl"
        aria-hidden
      >
        <defs>
          <linearGradient id="coach-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#coach-bg)" />
        {/* Face */}
        <ellipse cx="32" cy="28" rx="18" ry="16" fill="#1e3a5f" opacity="0.35" />
        {/* Eyes */}
        <ellipse cx="24" cy="26" rx="3" ry="4" fill="white" />
        <ellipse cx="40" cy="26" rx="3" ry="4" fill="white" />
        <circle cx="25" cy="27" r="1.5" fill="#0f172a" />
        <circle cx="41" cy="27" r="1.5" fill="#0f172a" />
        {/* Mouth */}
        {mood === 'alert' ? (
          <ellipse cx="32" cy="38" rx="4" ry="3" fill="white" opacity="0.9" />
        ) : mood === 'success' ? (
          <path d="M 24 36 Q 32 44 40 36" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 26 38 Q 32 42 38 38" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {/* Headset hint */}
        <path
          d="M 14 30 Q 14 18 32 16 Q 50 18 50 30"
          stroke="white"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
          strokeLinecap="round"
        />
        <rect x="10" y="28" width="6" height="10" rx="2" fill="white" opacity="0.7" />
        <rect x="48" y="28" width="6" height="10" rx="2" fill="white" opacity="0.7" />
        {/* Status LED */}
        <circle
          cx="52"
          cy="12"
          r="4"
          fill={mood === 'alert' ? '#f87171' : mood === 'success' ? '#4ade80' : '#60a5fa'}
        />
      </svg>
    </div>
  )
}
