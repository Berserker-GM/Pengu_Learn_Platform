import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

export function StaggeredGrid({
  images,
  bentoItems = [],
  centerText = "Halcyon",
  credits = {
    madeBy: { text: "@codrops", href: "https://x.com/codrops" },
    moreDemos: { text: "More demos", href: "https://tympanus.net/codrops/demos" }
  },
  className,
  showFooter = true
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const gridFullRef = useRef(null)
  const textRef = useRef(null)
  const [activeBento, setActiveBento] = useState(0)

  const splitText = (text) => {
    return text.split('').map((char, i) => (
      <span key={i} className="char inline-block" style={{ willChange: 'transform' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }

  // Build 35-slot grid. Slot 16 is bento group only if bentoItems present; otherwise just a photo.
  const hasBento = bentoItems && bentoItems.length > 0

  // Cycle through images to fill all 35 slots (skip 17 & 18 which are merged into bento span)
  const buildGridItems = () => {
    const imgCycle = (idx) => images[idx % images.length]
    const slots = []
    let imgIdx = 0
    for (let i = 0; i < 35; i++) {
      if (i === 16 && hasBento) {
        slots.push('BENTO_GROUP')
      } else if (i === 17 || i === 18) {
        slots.push(hasBento ? 'SKIP' : imgCycle(imgIdx++))
      } else {
        slots.push(imgCycle(imgIdx++))
      }
    }
    return slots
  }

  const gridItems = buildGridItems()

  useEffect(() => {
    // Use a short timeout fallback in case no imgs are found by imagesloaded
    const fallback = setTimeout(() => setIsLoaded(true), 800)

    const imgs = gridFullRef.current
      ? gridFullRef.current.querySelectorAll('img')
      : []

    if (imgs.length === 0) {
      setIsLoaded(true)
      clearTimeout(fallback)
      return
    }

    let loaded = 0
    const total = imgs.length
    const onLoad = () => {
      loaded++
      if (loaded >= total) {
        clearTimeout(fallback)
        document.body.classList.remove('loading')
        setIsLoaded(true)
      }
    }

    imgs.forEach((img) => {
      if (img.complete) {
        onLoad()
      } else {
        img.addEventListener('load', onLoad)
        img.addEventListener('error', onLoad) // count errors too so we never hang
      }
    })

    return () => {
      clearTimeout(fallback)
      imgs.forEach((img) => {
        img.removeEventListener('load', onLoad)
        img.removeEventListener('error', onLoad)
      })
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !gridFullRef.current) return

    // Kill any existing ScrollTriggers to avoid duplicates on hot reload
    ScrollTrigger.getAll().forEach(t => t.kill())

    // Animate Text
    if (textRef.current) {
      const chars = textRef.current.querySelectorAll('.char')
      gsap.timeline({
        scrollTrigger: {
          trigger: textRef.current,
          start: 'top bottom',
          end: 'center center-=25%',
          scrub: 1,
        }
      }).from(chars, {
        ease: 'sine.out',
        yPercent: 300,
        autoAlpha: 0,
        stagger: { each: 0.05, from: 'center' }
      })
    }

    // Animate Grid — group items by their offsetLeft (column position in CSS columns layout)
    const gridFullItems = Array.from(gridFullRef.current.querySelectorAll('.grid__item'))
    if (gridFullItems.length === 0) return

    // Detect column groups by measuring each item's left position
    const columnMap = new Map()
    gridFullItems.forEach((item) => {
      const left = Math.round(item.getBoundingClientRect().left)
      if (!columnMap.has(left)) columnMap.set(left, [])
      columnMap.get(left).push(item)
    })

    // Sort columns left to right
    const columnGroups = Array.from(columnMap.entries()).sort((a, b) => a[0] - b[0])
    const numColumns = columnGroups.length
    const middleColumnIndex = Math.floor(numColumns / 2)

    columnGroups.forEach(([, columnItems], columnIndex) => {
      if (columnItems.length === 0) return
      const delayFactor = Math.abs(columnIndex - middleColumnIndex) * 0.2
      gsap.timeline({
        scrollTrigger: {
          trigger: gridFullRef.current,
          start: 'top bottom',
          end: 'center center',
          scrub: 1.5,
        }
      })
        .from(columnItems, {
          yPercent: -450,
          autoAlpha: 0,
          delay: delayFactor,
          ease: 'sine.out',
        })
        .from(
          columnItems.map(item => item.querySelector('.grid__item-inner')).filter(Boolean),
          { transformOrigin: '50% 0%', ease: 'sine.out' },
          0
        )
    })
  }, [isLoaded])

  return (
    <div
      className={cn("relative overflow-hidden w-full", className)}
      style={{ '--grid-item-translate': '0px' }}
    >
      {/* Center text with character animation */}
      <section className="grid place-items-center w-full relative mt-[10vh]">
        <div
          ref={textRef}
          className="font-alt uppercase flex content-center text-[clamp(1.5rem,5vw,4rem)] leading-[0.7] text-[#2d2b27]"
        >
          {splitText(centerText)}
        </div>
      </section>

      {/* Photo grid — masonry columns rotated to bottom-align */}
      <section className="grid place-items-center w-full relative">
        <div
          ref={gridFullRef}
          className="grid--full relative w-full my-[6vh] max-w-none px-3 py-4"
          style={{ columnCount: 7, columnGap: '0.75rem', transform: 'rotate(180deg)', direction: 'rtl' }}
        >
          {gridItems.map((item, i) => {
            if (item === 'SKIP' || item === 'BENTO_GROUP') return null

            // Regular photo cell
            return (
              <figure
                key={`img-${i}`}
                className="grid__item m-0 relative z-10 will-change-[transform,opacity] overflow-hidden rounded-xl mb-3 break-inside-avoid"
                style={{ display: 'inline-block', width: '100%', direction: 'ltr' }}
              >
                <div className="rotate-180 w-full h-full">
                  <div className="grid__item-inner overflow-hidden rounded-xl">
                    <img
                      src={item}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-auto block"
                      style={{ display: 'block' }}
                    />
                  </div>
                </div>
              </figure>
            )
          })}
        </div>
      </section>

      {showFooter && (
        <footer className="w-full p-8 flex justify-between items-center relative z-50 text-[#2d2b27] uppercase font-medium text-xs tracking-wider">
          <a href={credits.madeBy.href} className="hover:opacity-60 transition-opacity">{credits.madeBy.text}</a>
          <a href={credits.moreDemos.href} className="hover:opacity-60 transition-opacity">{credits.moreDemos.text}</a>
        </footer>
      )}
    </div>
  )
}

export default StaggeredGrid
