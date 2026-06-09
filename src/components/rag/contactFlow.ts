export type AssistantMode = 'ask' | 'contact'
export type ContactStage = 'intent' | 'name' | 'email' | 'message' | 'confirm' | 'done'

export interface ContactData {
  intent: string
  name: string
  email: string
  message: string
}

export const CONTACT_EMAIL = '3199313768@qq.com'
export const CONTACT_PHONE = '17613712197'

export const CONTACT_INTENTS = [
  { id: 'intent:合作咨询', label: '💼 合作咨询', value: '合作咨询' },
  { id: 'intent:技术交流', label: '💬 技术交流', value: '技术交流' },
  { id: 'intent:面试机会', label: '🎯 面试机会', value: '面试机会' },
  { id: 'intent:就是打个招呼', label: '👋 打个招呼', value: '就是打个招呼' },
]

const CONTACT_PATTERNS = ['联系你', '怎么联系', '联系我', '合作', '面试', '电话', '邮箱', '加微信', '发邮件', '沟通']
const DIRECT_INFO_PATTERNS = ['邮箱是什么', '邮箱多少', '电话多少', '手机号', '联系方式', '怎么联系你']

export function createEmptyContactData(): ContactData {
  return {
    intent: '',
    name: '',
    email: '',
    message: '',
  }
}

export function detectContactIntent(message: string) {
  return CONTACT_PATTERNS.some(pattern => message.includes(pattern))
}

export function isDirectContactInfoRequest(message: string) {
  return DIRECT_INFO_PATTERNS.some(pattern => message.includes(pattern))
}

export function validateContactEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function createContactSubject(data: ContactData) {
  return `来自 Tech-Centric 的${data.intent || '联系'} - ${data.name || '访客'}`
}

export function createContactBody(data: ContactData) {
  return [
    `称呼：${data.name}`,
    `邮箱：${data.email}`,
    `意图：${data.intent}`,
    '',
    '留言：',
    data.message,
  ].join('\n')
}

export function buildMailtoUrl(data: ContactData) {
  const subject = encodeURIComponent(createContactSubject(data))
  const body = encodeURIComponent(createContactBody(data))
  const cc = encodeURIComponent(data.email)
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}&cc=${cc}`
}

export function createContactSummary(data: ContactData) {
  return {
    subject: createContactSubject(data),
    body: createContactBody(data),
    email: CONTACT_EMAIL,
    phone: CONTACT_PHONE,
  }
}
