import { useEffect, useRef } from 'react'
import phoneFrame from '../assets/images/Mockup de Smartphone Transparente.png'
import barberPanel from '../assets/images/Painel do barbeiro em novembro.png'
import clientsPanel from '../assets/images/Interface de Clientes em Tema Escuro.png'
import '../styles/scroll-phone-handoff.css'

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}
const mix = (from: number, to: number, t: number) => from + (to - from) * t

export default function ScrollPhoneHandoff() {
  const sectionRef = useRef<HTMLElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const update = () => {
      frame = 0
      const section = sectionRef.current
      const phone = phoneRef.current
      const anchor = document.querySelector<HTMLElement>('.hero-phone-anchor')
      const wrapper = document.querySelector<HTMLElement>('.hero-phone-wrap')
      if (!section || !phone || !anchor || !wrapper) return

      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      const scrollY = window.scrollY
      const start = section.offsetTop - screenHeight
      const end = section.offsetTop + section.offsetHeight - screenHeight * 0.95
      const progress = clamp((scrollY - start) / Math.max(1, end - start))
      const movement = reduceMotion.matches ? (progress > 0.05 ? 1 : 0) : ease(progress)

      const initial = anchor.getBoundingClientRect()
      const croppedBy = wrapper.getBoundingClientRect()
      const initialScale = initial.width / 520
      const topAtStart = initial.top + scrollY - start

      // The same phone leaves the hero, remains upright, and goes down-right.
      const finalScale = screenWidth < 700 ? 0.42 : 0.54
      const marginRight = screenWidth < 700 ? 16 : Math.min(100, screenWidth * 0.055)
      const rightX = screenWidth - 520 * finalScale - marginRight
      const bottomY = Math.max(topAtStart + screenHeight * 0.16, screenHeight * 0.60)

      const x = mix(initial.left, rightX, movement)
      const y = mix(topAtStart, bottomY, movement)
      const size = mix(initialScale, finalScale, movement)

      if (scrollY < start) {
        // On the first screen, match the original anchored position precisely.
        phone.style.transform = `translate3d(${initial.left}px, ${initial.top}px, 0) scale(${initialScale})`
      } else {
        phone.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${size})`
      }

      // Only the top of the phone is visible in the hero, exactly as before.
      const firstScreenVisible = Math.max(0, (croppedBy.bottom - initial.top) / Math.max(0.01, initialScale))
      const bottomClip = Math.max(0, 923.7 - firstScreenVisible)
      phone.style.clipPath = `inset(0 0 ${bottomClip * (1 - ease(progress * 9))}px 0)`

      // Keep the phone in the second section, not over later content.
      const sectionBottom = section.getBoundingClientRect().bottom
      phone.style.opacity = sectionBottom <= 0 ? '0' : '1'
    }

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('load', schedule)
    reduceMotion.addEventListener('change', schedule)
    document.fonts?.ready.then(schedule).catch(() => {})
    schedule()
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('load', schedule)
      reduceMotion.removeEventListener('change', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <section
        className="next-section"
        id="proximo-bloco"
        aria-label="Segunda seção da landing page"
        ref={sectionRef}
      >
        <div className="handoff-sticky" />
      </section>
      <div className="single-phone-floating" ref={phoneRef} aria-hidden="true">
        <div className="hero-phone single-phone-body">
          <div className="hero-phone-cards">
            <div className="hero-phone-card hero-phone-card--panel">
              <img src={barberPanel} alt="" />
            </div>
            <div className="hero-phone-card hero-phone-card--clients">
              <img src={clientsPanel} alt="" />
            </div>
          </div>
          <img className="hero-phone-frame" src={phoneFrame} alt="" />
        </div>
      </div>
    </>
  )
}
