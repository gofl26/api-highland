export interface User {
  id: string
  email: string
  password: string
  role: string
  user_name: string
  phone_number?: string
  gender?: string
  kakao_id?: string
  created_at: string
  updated_at: string
}

export interface PasswordNotIncludesUser {
  id: string
  email: string
  role: string
  user_name: string
  phone_number?: string
  gender?: string
  kakao_id?: string
  created_at: string
  updated_at: string
}
