'use client'

export function BouncingBasketball() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative w-32 h-32">
        {/* Basketball with bounce animation */}
        <div className="basketball-bounce absolute inset-0">
          <div className="relative w-full h-full">
            {/* Basketball sphere */}
            <div className="basketball-sphere w-full h-full rounded-full bg-gradient-to-br from-[#ff6b35] via-[#f4a261] to-[#e76f51] shadow-2xl flex items-center justify-center">
              {/* Basketball lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {/* Vertical line */}
                <path
                  d="M 50 0 Q 50 50 50 100"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Horizontal curved lines */}
                <path
                  d="M 0 30 Q 50 35 100 30"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M 0 70 Q 50 65 100 70"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Curved seams */}
                <path
                  d="M 15 0 Q 30 50 15 100"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M 85 0 Q 70 50 85 100"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Shadow */}
        <div className="basketball-shadow absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/20 rounded-full blur-md" />
      </div>

      <p className="mt-16 text-muted-foreground text-lg font-medium animate-pulse">
        Loading game data...
      </p>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-60px);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shadow-pulse {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translateX(-50%) scale(0.6);
            opacity: 0.4;
          }
        }

        .basketball-bounce {
          animation: bounce 1s infinite, spin 2s linear infinite;
        }

        .basketball-shadow {
          animation: shadow-pulse 1s infinite;
        }
      `}</style>
    </div>
  )
}
