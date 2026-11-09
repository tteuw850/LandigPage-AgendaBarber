import { useEffect, useRef } from 'react'
import financeShot from '../assets/images/financeiro-painel-3d.png'
import phoneFrame from '../assets/images/Mockup de Smartphone Transparente.png'
import angledFrame from '../assets/images/celularangulado.png'
import navShot from '../assets/images/tela completa 3d.png'
import servicesShot from '../assets/images/tela completa 2 3d.png'
import barberPanel from '../assets/images/01-agenda.jpg'
import clientsPanel from '../assets/images/02-clientes.jpg'
import statsPanel from '../assets/images/03-estatisticas.jpg'
import '../styles/diagonal-phone.css'

const clamp = (n: number) => Math.max(0, Math.min(1, n))
const smooth = (n: number) => {
  const t = clamp(n)
  return t * t * (3 - 2 * t)
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const PHONE_WIDTH = 520
const PHONE_HEIGHT = 520 * 1672 / 941

export default function DiagonalPhone({ featureTab }: { featureTab: 'agendamento' | 'financeiro' }) {
  const phoneRef = useRef<HTMLDivElement>(null)
  const angledPhoneRef = useRef<HTMLDivElement>(null)
  const featureTabRef = useRef(featureTab)
  const scheduleFeatureRef = useRef<() => void>(() => {})

  useEffect(() => {
    featureTabRef.current = featureTab
    scheduleFeatureRef.current()
  }, [featureTab])

  useEffect(() => {
    let raf = 0
    let lastFrameTime = 0
    let visualScroll = window.scrollY
    type PopupMotion = { value: number; from: number; to: number; startAt: number; duration: number }
    const makeMotion = (): PopupMotion => ({ value: 0, from: 0, to: 0, startAt: 0, duration: 286 })
    const agendaMotion = makeMotion()
    const clientsMotion = makeMotion()
    const statsMotion = makeMotion()
    const mobileMotion = makeMotion()
    const financeMotion = makeMotion()
    const whiteCardsMotion = makeMotion()
    // The reference mockup is the final card size, not a scroll-controlled maximum.
    // The cards settle once and remain still throughout the white section.
    const WHITE_CARD_FINAL_BURST = 0.45
    // Identical, reversible ease-in-out for every popup and both directions.
    const advancePopup = (motion: PopupMotion, target: number, frameTime: number, baseDuration = 286): number => {
      if (reducedMotion.matches) {
        motion.value = target
        motion.from = target
        motion.to = target
        motion.startAt = frameTime
        return target
      }
      if (motion.to !== target) {
        motion.from = motion.value
        motion.to = target
        motion.startAt = frameTime
        motion.duration = baseDuration * Math.max(0.15, Math.abs(target - motion.from))
      }
      const elapsed = clamp((frameTime - motion.startAt) / Math.max(1, motion.duration))
      motion.value = lerp(motion.from, motion.to, smooth(elapsed))
      if (elapsed >= 1) motion.value = motion.to
      return motion.value
    }
    let hasRendered = false
    // Once revealed in white, keep the side copy visible on reverse scroll
    // until the white section has fully left the viewport.
    let whiteCopyWasShown = false
    const progressLine = document.querySelector<HTMLElement>('.feature-progress-line > span')
    const activeNumber = document.querySelector<HTMLElement>('.feature-active-number')
    const secondClock = document.querySelector<HTMLElement>('.feature-second-clock')
    const thirdClock = document.querySelector<HTMLElement>('.feature-third-clock')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const update = (frameTime: number) => {
      raf = 0
      const phone = phoneRef.current
      const angledPhone = angledPhoneRef.current
      const anchor = document.querySelector<HTMLElement>('.hero-phone-anchor')
      const wrapper = document.querySelector<HTMLElement>('.hero-phone-wrap')
      const section = document.getElementById('proximo-bloco')
      if (!phone || !angledPhone || !anchor || !wrapper || !section) return

      // One visible full-height black canvas, with extra scroll distance
      // for the second storytelling step (sticky presentation).
      const firstScreen = document.querySelector<HTMLElement>('.landing-first-screen')
      const firstHeight = firstScreen?.getBoundingClientRect().height ?? window.innerHeight
      const secondRunway = Math.max(window.innerHeight * 1.9, 1250)
      const thirdRunway = Math.max(window.innerHeight * 1.15, 820)
      const exitRunway = Math.max(window.innerHeight * 1.45, 1100)
      // Release the sticky black stage precisely when the angled phone starts moving.
      // The rest of the exit animation continues over the incoming white stage.
      const diagonalStart = 0.48
      const extraScroll = secondRunway + thirdRunway + exitRunway * diagonalStart
      const storyHeight = firstHeight + extraScroll
      if (Math.abs(section.getBoundingClientRect().height - storyHeight) > 1) {
        section.style.height = storyHeight + 'px'
      }
      const screenHeightValue = firstHeight + 'px'
      // Extra white scroll distance drives the final card zoom.
      const cardsZoomRunway = Math.max(window.innerHeight * 0.85, 620)
      const whiteStoryHeight = (firstHeight + cardsZoomRunway) + 'px'
      const whiteSection = document.getElementById('secao-branca')
      if (whiteSection && whiteSection.style.height !== whiteStoryHeight) {
        whiteSection.style.height = whiteStoryHeight
      }
      // Match the next black chapter to the exact rendered white scroll height.
      const blackFollowSection = document.getElementById('secao-preta-final')
      if (blackFollowSection && blackFollowSection.style.height !== whiteStoryHeight) {
        blackFollowSection.style.height = whiteStoryHeight
      }
      if (section.style.getPropertyValue('--feature-screen-height') !== screenHeightValue) {
        section.style.setProperty('--feature-screen-height', screenHeightValue)
      }
      const vh = window.innerHeight
      const vw = section.getBoundingClientRect().width
      const actualScroll = window.scrollY
      const dt = lastFrameTime ? Math.min(48, Math.max(8, frameTime - lastFrameTime)) : 16.7
      lastFrameTime = frameTime
      // Native scroll stays untouched; only the visual timeline is damped.
      if (!hasRendered || reducedMotion.matches || Math.abs(actualScroll - visualScroll) > window.innerHeight * 5) {
        visualScroll = actualScroll
      } else {
        visualScroll += (actualScroll - visualScroll) * (1 - Math.exp(-dt / 95))
        if (Math.abs(actualScroll - visualScroll) < 0.25) visualScroll = actualScroll
      }
      hasRendered = true
      const scroll = visualScroll
      const sectionTop = section.getBoundingClientRect().top + actualScroll
      const start = sectionTop - vh * 0.62
      const distance = Math.max(1, sectionTop - start)
      const progress = clamp((actualScroll - start) / distance)
      const animatedProgress = clamp((scroll - start) / distance)
      const stepTwo = clamp((scroll - sectionTop) / Math.max(1, secondRunway * 0.82))
      const stepThree = clamp((scroll - sectionTop - secondRunway) / Math.max(1, thirdRunway * 0.86))
      // A fourth, invisible beat closes all popups while the black scene stays pinned.
      // Same scroll threshold in both directions: closing downward, opening upward.
      const exitAt = sectionTop + secondRunway + thirdRunway
      const exitStarted = actualScroll >= exitAt
      // Use native scroll so the entering white section and phone share one timeline.
      const exitProgress = clamp((actualScroll - exitAt) / Math.max(1, exitRunway))
      // The same trigger positions govern both directions. When scrolling
      // stops, the current card remains in place; reversing the scroll
      // crosses those same positions and plays the exact inverse motion.
      const agendaTarget = animatedProgress >= 0.83 ? 1 : 0
      const clientsTarget = stepTwo >= 0.56 ? 1 : 0
      const statsTarget = stepThree >= 0.045 ? 1 : 0
      const agendaPopValue = advancePopup(agendaMotion, agendaTarget, frameTime)
      const clientsPopValue = advancePopup(clientsMotion, clientsTarget, frameTime)
      const statsZoomValue = advancePopup(statsMotion, statsTarget, frameTime)
      const mobileHoldTarget = exitStarted || clientsTarget > 0 ? 1 : 0
      const mobileHold = advancePopup(mobileMotion, mobileHoldTarget, frameTime)
      const zoomTarget = statsTarget

      const travel = reducedMotion.matches ? (progress > 0.5 ? 1 : 0) : smooth(progress)

      const anchorBox = anchor.getBoundingClientRect()
      const wrapBox = wrapper.getBoundingClientRect()
      const initialScale = anchorBox.width / PHONE_WIDTH
      const initialX = anchorBox.left
      const initialY = anchorBox.top
      const startingY = anchorBox.top + actualScroll - start

      const desiredScale = vw < 620 ? 0.39 : vw < 1024 ? 0.60 : 0.77
      const usableHeight = Math.min(vh, section.getBoundingClientRect().height)
      const finalScale = Math.min(desiredScale, Math.max(0.22, (usableHeight - 24) / PHONE_HEIGHT))
      const marginRight = vw < 620 ? 14 : vw <= 1050 ? 56 : Math.max(36, (vw - 1160) / 2)
      const finalX = vw - PHONE_WIDTH * finalScale - marginRight
      const finalY = vw < 620 ? Math.max(0, vh - PHONE_HEIGHT * finalScale - 18) : (vh - PHONE_HEIGHT * finalScale) / 2

      // First follow natural scrolling, then move right/down and become smaller.
      const freeze = smooth(progress / 0.20)
      const movingOriginY = lerp(initialY, startingY, freeze)
      // On mobile, shift the handset left to leave room for a right-side popup.
      const mobileClearance = vw < 620 ? 72 * smooth(mobileHold) : 0
      const x = lerp(initialX, finalX, travel) - mobileClearance
      // On small screens, blend natural upward movement into the docked
      // position without overshooting and bouncing back down.
      const mobileAnchorDocumentY = anchorBox.top + actualScroll
      const mobileParkedY = finalY + (mobileAnchorDocumentY - finalY) * Math.exp(-Math.max(0, actualScroll) / 85)
      const y = vw < 620 ? mobileParkedY : lerp(movingOriginY, finalY, travel)
      const scale = lerp(initialScale, finalScale, travel)

      phone.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      // Screen 2 -> 3: retract, hide, crossfade, then move diagonally left.
      // Every phase reverses on upward scroll and never touches screen 1 -> 2.
      const retract = reducedMotion.matches ? (exitProgress >= 0.38 ? 1 : 0) : smooth(exitProgress / 0.38)
      const cardsGone = reducedMotion.matches ? (exitProgress >= 0.48 ? 1 : 0) : smooth((exitProgress - 0.38) / 0.10)
      phone.style.setProperty('--cards-exit-opacity', String(1 - cardsGone))
      // Both tilt and translation start together as soon as the cards disappear.
      // A single progress value drives diagonal X and Y movement without separate phases.
      const desiredTravel = reducedMotion.matches
        ? (exitProgress >= diagonalStart ? 1 : 0)
        : smooth((exitProgress - diagonalStart) / 0.47)
      const desiredAppearance = reducedMotion.matches
        ? (exitProgress >= diagonalStart ? 1 : 0)
        : smooth((exitProgress - diagonalStart) / 0.12)
      // Position and crossfade respond on the same frame as the white stage.
      const angleTravel = desiredTravel
      const angledAppearance = desiredAppearance
      // Follow the scroll diagonally while keeping the provided mockup tilted.
      const angledBaseHeight = PHONE_HEIGHT * scale
      // Keep the first two scenes unchanged; enlarge only the angled phone
      // at the end of the black-to-white transition.
      // Cap the size by viewport so the frame remains fully visible.
      const angledFinalHeight = Math.min(
        angledBaseHeight * 1.12,
        vw < 620 ? vh * 0.45 : vh * 0.89
      )
      const angledHeight = lerp(angledBaseHeight, angledFinalHeight, angleTravel)
      const angledWidth = angledHeight * (1086 / 1448)
      const uprightWidth = PHONE_WIDTH * scale
      const angledStartX = x + (uprightWidth - angledBaseHeight * (1086 / 1448)) / 2
      const angledStartY = y
      // Align the VISIBLE metal frame with the start of the section 2 copy.
      // The transparent PNG has a 221px left inset at its natural 1448px height.
      const copyLeft = section.querySelector<HTMLElement>('.feature-copy')?.getBoundingClientRect().left
      const visibleFrameInset = angledFinalHeight * (221 / 1448)
      const angledEndX = (copyLeft ?? Math.max(28, vw * 0.075)) - visibleFrameInset + angledFinalHeight * 0.012
      // The PNG has transparent padding: visible frame y=46..1414 / 1448.
      // Center the metal handset, not the transparent image canvas.
      const visibleFrameCenterY = (46 + 1414) / (2 * 1448)
      const angledEndY = vw < 620
        ? Math.min(vh * 0.72, vh - angledFinalHeight - 18)
        : vh / 2 - angledFinalHeight * visibleFrameCenterY
      const angledX = lerp(angledStartX, angledEndX, angleTravel)
      // Match the white copy sticky lifecycle: pin while it is pinned, then
      // let the handset leave upward at exactly the same speed as the text.
      // This prevents the phone from looking like it sinks behind the next black section.
      const whiteSticky = whiteSection?.querySelector<HTMLElement>('.white-feature-sticky')
      const whiteStickyRelease = angleTravel >= 0.999 && whiteSticky
        ? Math.min(0, whiteSticky.getBoundingClientRect().top)
        : 0
      const angledY = lerp(angledStartY, angledEndY, angleTravel) + whiteStickyRelease
      const angledTransform = 'translate3d(' + angledX + 'px, ' + angledY + 'px, 0) rotateZ(' + (-1.4 * angleTravel) + 'deg)'
      if (angledPhone.style.width !== angledWidth + 'px') angledPhone.style.width = angledWidth + 'px'
      if (angledPhone.style.height !== angledHeight + 'px') angledPhone.style.height = angledHeight + 'px'
      if (angledPhone.style.transform !== angledTransform) angledPhone.style.transform = angledTransform
      const angledOpacity = String((!whiteSection || whiteSection.getBoundingClientRect().bottom > 1) ? angledAppearance : 0)
      if (angledPhone.style.opacity !== angledOpacity) angledPhone.style.opacity = angledOpacity
      // The white section must fill the viewport before the cards appear.
      // The phone finishes turning first; only on the final white screen
      // do these two static 3D mockups become visible.
      const whitePosition = whiteSection?.getBoundingClientRect().top ?? vh
      const cardsAtFinalPose = angleTravel >= 0.999 && whitePosition <= 1
      // Grow just once to the reference size when the white stage is ready.
      // Native scrolling within that section must NOT move or resize the cards.
      const whiteCardsTarget = cardsAtFinalPose ? 1 : 0
      const whiteCardsReveal = advancePopup(whiteCardsMotion, whiteCardsTarget, frameTime, 700)
      const cardsFixedZoom = whiteCardsReveal * WHITE_CARD_FINAL_BURST
      const financeTarget = featureTabRef.current === 'financeiro' ? 1 : 0
      // Two-phase, reversible card switch: retract scheduling first, then
      // enlarge Financeiro. This is a time-based animation triggered by click;
      // the existing scroll-driven phone movement remains untouched.
      const financeProgress = advancePopup(financeMotion, financeTarget, frameTime, 1040)
      const retractCards = smooth(financeProgress / 0.55)
      // Do not hide the cards immediately when scrolling back across the
      // white-section boundary. Keep them visible while the 700ms reverse
      // zoom folds into the phone, and fade only near the end of the return.
      const returningPopupOpacity = reducedMotion.matches
        ? whiteCardsReveal
        : smooth(clamp((whiteCardsReveal - 0.08) / 0.22))
      const scheduleOpacity = returningPopupOpacity * (1 - smooth((financeProgress - 0.40) / 0.15))
      const financeOpacity = returningPopupOpacity * smooth((financeProgress - 0.56) / 0.17)
      // The Financeiro panel uses the SAME native scroll progress as the two
      // Agendamento cards. The click still retracts the previous cards first,
      // but scrolling up/down reverses this panel zoom continuously.
      const financeReveal = smooth((financeProgress - 0.53) / 0.47)
      // Financeiro also stays still after its switching animation completes.
      const financeZoom = whiteCardsReveal * financeReveal
      angledPhone.style.setProperty('--angled-cards-opacity', String(scheduleOpacity))
      angledPhone.style.setProperty('--angled-cards-burst', String(cardsFixedZoom * (1 - retractCards)))
      angledPhone.style.setProperty('--finance-popup-opacity', String(financeOpacity))
      angledPhone.style.setProperty('--finance-popup-expand', String(financeZoom))
      // Reveal the tutorial alongside the popups on the first downward pass.
      // On reverse scroll keep the lateral text visible while the white stage
      // is still onscreen; do not couple its visibility to the card zoom.
      const whiteBounds = whiteSection?.getBoundingClientRect()
      const whiteStillVisible = !!whiteBounds && whiteBounds.top < vh && whiteBounds.bottom > 0
      if (cardsAtFinalPose) whiteCopyWasShown = true
      if (!whiteStillVisible) whiteCopyWasShown = false
      const tutorialVisible = whiteCopyWasShown && whiteStillVisible
      whiteSection?.style.setProperty('--white-tutorial-opacity', tutorialVisible ? '1' : '0')
      // Initial entrance slides upward, matching the Agendamento/Financeiro swap.
      // The side text stays at its final position while scrolling back up.
      whiteSection?.style.setProperty('--white-tutorial-shift', tutorialVisible ? '0px' : (vw < 720 ? '24px' : '42px'))
      // The two mockups remain fixed inside the screen and follow the handset only.
      const reveal = reducedMotion.matches ? (animatedProgress >= 0.88 ? 1 : 0) : smooth((animatedProgress - 0.78) / 0.20)
      phone.style.setProperty('--stats-opacity', String(reveal))
      phone.style.setProperty('--stats-shift', (42 * (1 - reveal)) + 'px')

      // Popups saem uma única vez e permanecem fora do mockup.
      // Não adicionamos imagens duplicadas nem movimentos laterais ao celular.
      const agendaLift = agendaPopValue * (1 - retract)
      phone.style.setProperty('--agenda-pop-x', (-45 * agendaLift) + 'px')
      phone.style.setProperty('--agenda-pop-y', (-45 * agendaLift) + 'px')
      phone.style.setProperty('--agenda-pop-scale', String(1 + 0.55 * agendaLift))
      phone.style.setProperty('--agenda-pop-progress', String(agendaLift))
      const clientsLift = clientsPopValue * (1 - retract)
      phone.style.setProperty('--clients-pop-x', (70 * clientsLift) + 'px')
      phone.style.setProperty('--clients-pop-y', (-45 * clientsLift) + 'px')
      phone.style.setProperty('--clients-pop-scale', String(1 + 0.55 * clientsLift))
      // Third scene: Statistics only zooms forward from its center.
      const statsZoom = statsZoomValue * (1 - retract)
      phone.style.setProperty('--stats-zoom-scale', String(1 + 0.52 * statsZoom))
      // Real foreground extrusion: the card leaves the phone in both axes.
      phone.style.setProperty('--stats-pop-x', (-65 * statsZoom) + 'px')
      phone.style.setProperty('--stats-pop-y', (24 * statsZoom) + 'px')
      phone.style.setProperty('--stats-zoom-progress', String(statsZoom))
      const copyReveal = reducedMotion.matches
        ? (animatedProgress >= 0.84 ? 1 : 0)
        : smooth((animatedProgress - 0.54) / 0.42)
      section.style.setProperty('--feature-opacity', String(copyReveal))
      section.style.setProperty('--feature-offset', (26 * (1 - copyReveal)) + 'px')
      // Synchronize copy, counters, seconds and the golden progress bar.
      const firstFade = exitStarted ? 0 : 1 - clientsLift
      const secondFade = exitStarted ? 0 : clientsLift * (1 - statsZoom)
      const thirdFade = exitStarted ? 1 : statsZoom
      section.style.setProperty('--feature-one-opacity', String(firstFade))
      section.style.setProperty('--feature-two-opacity', String(secondFade))
      section.style.setProperty('--feature-three-opacity', String(thirdFade))
      // Composited scale avoids expensive width/layout recalculation.
      const progressScale = exitStarted ? 1 : (33.333 + 33.333 * clientsLift + 33.334 * statsZoom) / 100
      if (progressLine) progressLine.style.transform = 'scaleX(' + progressScale + ')'
      const activeStep = exitStarted ? '3' : statsZoom >= 0.5 ? '3' : clientsLift >= 0.5 ? '2' : '1'
      if (section.dataset.step !== activeStep) section.dataset.step = activeStep
      const number = activeNumber
      if (number && number.textContent !== '0' + activeStep) number.textContent = '0' + activeStep
      const seconds = secondClock
      const currentSeconds = '00:0' + (3 + Math.round(2 * clientsLift))
      if (seconds && seconds.textContent !== currentSeconds) seconds.textContent = currentSeconds
      // The third scene clock is cached for the animation loop.
      const thirdSeconds = '00:0' + (5 + Math.round(3 * (exitStarted ? 1 : statsZoom)))
      if (thirdClock && thirdClock.textContent !== thirdSeconds) thirdClock.textContent = thirdSeconds

      // Match the original hero crop, then gradually reveal the full phone.
      const visible = Math.max(0, (wrapBox.bottom - anchorBox.top) / Math.max(0.001, initialScale))
      const crop = Math.max(0, PHONE_HEIGHT - visible)
      const nextClip = progress >= 0.2 ? 'none' : `inset(0px 0px ${crop * (1 - smooth(progress / 0.20))}px 0px)`
      if (phone.style.clipPath !== nextClip) phone.style.clipPath = nextClip

      // Stay fixed at full opacity while the black section is visible.
      // The white section covers the phone only at the shared boundary.
      const blackBottom = section.getBoundingClientRect().bottom
      const opacityValue = String((blackBottom > 1 ? 1 : 0) * (1 - angledAppearance))
      if (phone.style.opacity !== opacityValue) phone.style.opacity = opacityValue
      if (!reducedMotion.matches && (Math.abs(window.scrollY - visualScroll) > 0.25 || Math.abs(agendaTarget - agendaPopValue) > 0.001 || Math.abs(clientsTarget - clientsPopValue) > 0.001 || Math.abs(zoomTarget - statsZoomValue) > 0.001 || Math.abs(desiredTravel - angleTravel) > 0.001 || Math.abs(desiredAppearance - angledAppearance) > 0.001 || Math.abs(mobileHoldTarget - mobileHold) > 0.001 || Math.abs(financeTarget - financeProgress) > 0.001 || Math.abs(whiteCardsTarget - whiteCardsReveal) > 0.001)) {
        schedule()
      }
    }

    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('load', schedule)
    reducedMotion.addEventListener('change', schedule)
    document.fonts?.ready.then(schedule).catch(() => {})
    scheduleFeatureRef.current = schedule
    schedule()

    return () => {
      scheduleFeatureRef.current = () => {}
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('load', schedule)
      reducedMotion.removeEventListener('change', schedule)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
    <div className="diagonal-phone" ref={phoneRef} aria-hidden="true">
      <div className="hero-phone diagonal-phone-shell">
        <div className="hero-phone-cards">
          <div className="hero-phone-card hero-phone-card--panel">
            <img src={barberPanel} alt="" />
          </div>
          <div className="hero-phone-card hero-phone-card--clients">
            <img src={clientsPanel} alt="" />
          </div>
          <div className="hero-phone-card hero-phone-card--stats">
            <img src={statsPanel} alt="" />
          </div>
        </div>
        <img className="hero-phone-frame" src={phoneFrame} alt="" />
      </div>
    </div>
      <div className="diagonal-phone-angled-frame" ref={angledPhoneRef} aria-hidden="true">
        <div className="diagonal-phone-angled-screen">
          <div className="diagonal-float-card diagonal-float-card--upper"><img src={navShot} alt="" /></div>
          <div className="diagonal-float-card diagonal-float-card--lower"><img src={servicesShot} alt="" /></div>
        </div>
        <img className="diagonal-phone-angled-shell" src={angledFrame} alt="" />
        <img className="diagonal-finance-popup" src={financeShot} alt="" />
      </div>
    </>
  )
}
