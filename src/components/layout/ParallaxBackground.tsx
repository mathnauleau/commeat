import { useEffect, useRef } from 'react'
import onionImg from '../../assets/img/onion.png'
import broccoliImg from '../../assets/img/broccoli.png'
import cheeseImg from '../../assets/img/cheese.png'
import fishImg from '../../assets/img/fish.png'
import tomatoImg from '../../assets/img/tomato.png'
import jambonImg from '../../assets/img/jambon.png'
import pasta1Img from '../../assets/img/pasta-1.png'
import pasta2Img from '../../assets/img/pasta-2.png'
import radisImg from '../../assets/img/radis.png'

interface FloatItem {
  src: string
  left?: string
  right?: string
  top: string
  width: number
  opacity: number
  rotate: number
  speed: number // translateY = scrollY * speed
}

const ITEMS: FloatItem[] = [
  { src: onionImg,   left: '4%',  top: '8%',   width: 140, opacity: 0.5, rotate: -18, speed: 0.22 },
  { src: tomatoImg,  right: '6%', top: '18%',  width: 100, opacity: 0.5, rotate: 12,  speed: 0.38 },
  { src: broccoliImg,left: '2%',  top: '42%',  width: 120, opacity: 0.5, rotate: 8,   speed: 0.28 },
  { src: cheeseImg,  right: '4%', top: '55%',  width: 95,  opacity: 0.5, rotate: -22, speed: 0.18 },
  { src: fishImg,    left: '68%', top: '72%',  width: 130, opacity: 0.5, rotate: -6,  speed: 0.14 },
  { src: jambonImg,  right: '5%', top: '80%',  width: 110, opacity: 0.5, rotate: 15,  speed: 0.32 },
  { src: pasta1Img,  left: '3%',  top: '115%', width: 125, opacity: 0.5, rotate: -10, speed: 0.20 },
  { src: pasta2Img,  right: '7%', top: '130%', width: 105, opacity: 0.5, rotate: 20,  speed: 0.35 },
  { src: radisImg,   left: '65%', top: '145%', width: 90,  opacity: 0.5, rotate: -14, speed: 0.25 },
]

export function ParallaxBackground() {
  const refs = useRef<(HTMLImageElement | null)[]>([])

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      ITEMS.forEach((item, i) => {
        const el = refs.current[i]
        if (el) {
          el.style.transform = `translateY(${y * item.speed}px) rotate(${item.rotate}deg)`
        }
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1 }}
    >
      {ITEMS.map((item, i) => (
        <img
          key={i}
          ref={(el) => { refs.current[i] = el }}
          src={item.src}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            left: item.left,
            right: item.right,
            top: item.top,
            width: item.width,
            opacity: item.opacity,
            transform: `rotate(${item.rotate}deg)`,
            userSelect: 'none',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  )
}
