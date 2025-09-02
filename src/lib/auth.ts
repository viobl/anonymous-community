import { v4 as uuidv4 } from 'uuid'

const ANONYMOUS_ID_KEY = 'anonymous_user_id'

export function getAnonymousId(): string {
  if (typeof window === 'undefined') return uuidv4()
  
  let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY)
  
  if (!anonymousId) {
    anonymousId = uuidv4()
    localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId)
  }
  
  return anonymousId
}

export function generateAnonymousName(anonymousId: string): string {
  const colors = ['빨간', '파란', '초록', '노란', '보라', '주황', '분홍', '검은', '하얀', '갈색']
  const animals = ['고양이', '강아지', '토끼', '여우', '늑대', '곰', '호랑이', '사자', '코끼리', '펭귄']
  
  const hash = anonymousId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const colorIndex = Math.abs(hash) % colors.length
  const animalIndex = Math.abs(hash >> 8) % animals.length
  
  return `${colors[colorIndex]} ${animals[animalIndex]}`
}