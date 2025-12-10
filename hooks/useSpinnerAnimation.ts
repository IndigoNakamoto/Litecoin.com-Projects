import { useEffect, useRef } from 'react'

/**
 * Custom hook to handle the rotating spinner animation based on scroll
 * @returns refs for outer and inner spinner elements
 */
export function useSpinnerAnimation() {
  const outerSpinnerRef = useRef<HTMLImageElement>(null)
  const innerSpinnerRef = useRef<HTMLImageElement>(null)

  // Scroll-based rotation animation
  useEffect(() => {
    let previousScrollY = window.scrollY
    let rotationAngle = 0

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - previousScrollY
      rotationAngle += scrollDelta * 0.08
      if (outerSpinnerRef.current) {
        outerSpinnerRef.current.style.transform = `rotate(${rotationAngle}deg)`
      }
      previousScrollY = currentScrollY
    }

    let requestId: number
    const animate = () => {
      requestId = requestAnimationFrame(animate)
      handleScroll()
    }
    animate()
    
    return () => {
      cancelAnimationFrame(requestId)
    }
  }, [])

  // Inner spinner sizing and positioning
  useEffect(() => {
    if (innerSpinnerRef.current && outerSpinnerRef.current) {
      const innerElement = innerSpinnerRef.current
      const outerElement = outerSpinnerRef.current
      
      const updateSize = () => {
        const outerWidth = outerElement.offsetWidth
        const outerHeight = outerElement.offsetHeight
        // Make inner spinner 40% of outer spinner size
        const innerSize = Math.min(outerWidth, outerHeight) * 0.35
        innerElement.style.width = `${innerSize}px`
        innerElement.style.height = `${innerSize}px`
        // Center the inner spinner within the outer spinner, offset up by 4px
        innerElement.style.transform = 'translate(-50%, calc(-50% - 6px))'
      }
      
      // Wait for images to load
      const initSize = () => {
        if (outerElement.complete) {
          updateSize()
        } else {
          outerElement.addEventListener('load', updateSize, { once: true })
        }
      }
      
      initSize()
      
      // Update on resize
      const resizeObserver = new ResizeObserver(updateSize)
      resizeObserver.observe(outerElement)
      
      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [])

  return { outerSpinnerRef, innerSpinnerRef }
}

