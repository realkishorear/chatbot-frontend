export type Message = {
  role: 'user' | 'bot'
  type: 'text' | 'menu'
  content: string
  timestamp?: string // add this
}

// export type Message = {
//   id: string
//   role: 'user' | 'bot'
//   type: 'text' | 'menu'
//   content: string
//   timestamp?: string
// }



export type FamilyMember = {
  UserName: string
  UserDetailsID: string | number
}
