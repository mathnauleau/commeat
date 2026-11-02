import onionImg from '../assets/img/onion.png'
import broccoliImg from '../assets/img/broccoli.png'
import cheeseImg from '../assets/img/cheese.png'
import fishImg from '../assets/img/fish.png'
import tomatoImg from '../assets/img/tomato.png'
import jambonImg from '../assets/img/jambon.png'
import pasta1Img from '../assets/img/pasta-1.png'
import pasta2Img from '../assets/img/pasta-2.png'
import radisImg from '../assets/img/radis.png'
import garlicImg from '../assets/img/garlic.png'
import shrimpImg from '../assets/img/shrimp.png'

const ART = [tomatoImg, onionImg, shrimpImg, pasta1Img, broccoliImg, radisImg, fishImg, garlicImg, cheeseImg, jambonImg, pasta2Img]
const KEYWORD_ART: Record<string, string> = {
  tomat: tomatoImg,
  onion: onionImg,
  shrimp: shrimpImg,
  pasta: pasta1Img,
  orzo: pasta2Img,
  lasagn: pasta2Img,
  broccoli: broccoliImg,
  radis: radisImg,
  fish: fishImg,
  garlic: garlicImg,
}
const TINTS = ['var(--gold-200)', 'var(--green-200)', 'var(--gold-100)', 'var(--green-100)']

function hash(s: string): number {
  let h = 7
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/** Felt illustration for a recipe with no photo — same slug, same art. */
export function recipeArt(slug: string): { src: string; tint: string; rotate: number } {
  const h = hash(slug)
  const keyword = Object.keys(KEYWORD_ART).find((k) => slug.includes(k))
  return {
    src: keyword ? KEYWORD_ART[keyword] : ART[h % ART.length],
    tint: TINTS[h % TINTS.length],
    rotate: (h % 25) - 12,
  }
}
