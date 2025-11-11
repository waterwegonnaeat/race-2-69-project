'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface TeamLogoProps {
  teamName: string
  logoUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  clickable?: boolean
  className?: string
  showTooltip?: boolean
}

const sizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const pixelSizeMap = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
}

export function TeamLogo({
  teamName,
  logoUrl,
  size = 'md',
  clickable = true,
  className,
  showTooltip = true,
}: TeamLogoProps) {
  const router = useRouter()

  const handleClick = () => {
    if (clickable) {
      // Navigate to main page with team filter and scroll to team-analysis
      router.push(`/?team=${encodeURIComponent(teamName)}`)

      // Use setTimeout to allow navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById('team-analysis')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  // If no logo, show a fallback with team initials
  if (!logoUrl) {
    const initials = teamName
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br from-basketball-orange to-warm-orange text-white font-bold',
          sizeMap[size],
          clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
          className
        )}
        onClick={handleClick}
        title={showTooltip ? `View ${teamName} stats` : undefined}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={clickable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        } : undefined}
        style={{
          fontSize: size === 'xs' ? '8px' : size === 'sm' ? '10px' : size === 'md' ? '12px' : size === 'lg' ? '16px' : '20px'
        }}
      >
        {initials}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex-shrink-0 overflow-hidden rounded',
        sizeMap[size],
        clickable && 'cursor-pointer hover:ring-2 hover:ring-basketball-orange transition-all',
        className
      )}
      onClick={handleClick}
      title={showTooltip ? `View ${teamName} stats` : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      } : undefined}
    >
      <Image
        src={logoUrl}
        alt={`${teamName} logo`}
        width={pixelSizeMap[size]}
        height={pixelSizeMap[size]}
        className="object-contain"
        onError={(e) => {
          // Hide broken image and show fallback
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}

// Component for displaying team name with logo
interface TeamWithLogoProps extends TeamLogoProps {
  nameClassName?: string
  layout?: 'horizontal' | 'vertical'
  logoPosition?: 'left' | 'right'
}

export function TeamWithLogo({
  teamName,
  logoUrl,
  size = 'sm',
  clickable = true,
  className,
  nameClassName,
  layout = 'horizontal',
  logoPosition = 'left',
  showTooltip = false,
}: TeamWithLogoProps) {
  const router = useRouter()

  const handleClick = () => {
    if (clickable) {
      // Navigate to main page with team filter and scroll to team-analysis
      router.push(`/?team=${encodeURIComponent(teamName)}`)

      // Use setTimeout to allow navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById('team-analysis')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  const content = (
    <>
      {layout === 'horizontal' && logoPosition === 'left' && (
        <TeamLogo
          teamName={teamName}
          logoUrl={logoUrl}
          size={size}
          clickable={false}
          showTooltip={false}
        />
      )}
      <span className={cn('font-medium', nameClassName)}>
        {teamName}
      </span>
      {layout === 'horizontal' && logoPosition === 'right' && (
        <TeamLogo
          teamName={teamName}
          logoUrl={logoUrl}
          size={size}
          clickable={false}
          showTooltip={false}
        />
      )}
      {layout === 'vertical' && (
        <TeamLogo
          teamName={teamName}
          logoUrl={logoUrl}
          size={size}
          clickable={false}
          showTooltip={false}
        />
      )}
    </>
  )

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        layout === 'vertical' && 'flex-col text-center',
        clickable && 'cursor-pointer hover:text-basketball-orange transition-colors',
        className
      )}
      onClick={clickable ? handleClick : undefined}
      title={showTooltip && clickable ? `View ${teamName} stats` : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      } : undefined}
    >
      {content}
    </div>
  )
}
