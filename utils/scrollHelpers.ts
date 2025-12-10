/**
 * Utility functions for smooth scrolling to elements
 */

const DEFAULT_Y_OFFSET = -64

/**
 * Smoothly scrolls to a target element with an optional offset
 */
export function scrollToElement(
  element: HTMLElement | null,
  yOffset: number = DEFAULT_Y_OFFSET
): void {
  if (!element) return
  
  const yPosition = element.getBoundingClientRect().top + window.scrollY + yOffset
  window.scrollTo({ top: yPosition, behavior: 'smooth' })
}

