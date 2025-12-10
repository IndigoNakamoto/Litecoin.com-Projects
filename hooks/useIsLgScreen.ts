import { useEffect, useState } from 'react'

/**
 * Custom hook to detect if the screen is large (lg breakpoint: 1024px)
 * @returns boolean indicating if screen width is >= 1024px
 */
export function useIsLgScreen(): boolean {
  const [isLgScreen, setIsLgScreen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleResize = () => {
      setIsLgScreen(mediaQuery.matches)
    }
    handleResize()
    mediaQuery.addEventListener('change', handleResize)
    return () => {
      mediaQuery.removeEventListener('change', handleResize)
    }
  }, [])

  return isLgScreen
}

