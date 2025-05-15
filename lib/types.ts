export type Message = {
  role: 'user' | 'bot'
  type: 'text' | 'menu'
  content: string
  timestamp?: string // add this
}
