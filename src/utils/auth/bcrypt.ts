import bcrypt from 'bcrypt'

export const hashPassword = async (plainPassword: string) => {
  const saltRounds = 12
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)
  return hashedPassword
}

export const checkPassword = async (plainPassword: string, hashedPassword: string) => {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword)
  return isMatch
}
