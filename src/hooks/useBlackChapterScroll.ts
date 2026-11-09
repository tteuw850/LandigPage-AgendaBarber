import { useEffect, useRef, useState } from 'react'
const clamp = (n: number) => Math.max(0, Math.min(1, n))

export function useBlackChapterScroll(steps: number) {
 const sectionRef = useRef<HTMLElement>(null)
 const [activeStep, setActiveStep] = useState(0)
 useEffect(() => {
  let frame = 0
  const update = () => {
   frame = 0
   const section = sectionRef.current
   if (!section) return
   const bounds = section.getBoundingClientRect()
   const progress = clamp(-bounds.top / Math.max(1, bounds.height - innerHeight))
   section.style.setProperty('--black-chapter-progress', String(progress))
   setActiveStep(current => {
    const next = Math.min(steps - 1, Math.floor(progress * steps))
    return current === next ? current : next
   })
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  schedule()
  return () => {
   window.removeEventListener('scroll', schedule)
   window.removeEventListener('resize', schedule)
   if (frame) cancelAnimationFrame(frame)
  }
 }, [steps])
 return { sectionRef, activeStep }
}
