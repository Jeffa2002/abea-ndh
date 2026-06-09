export function validatePassword(password: string, context: { email?: string } = {}) {
  const failures: string[] = []
  if (password.length < 14) failures.push('Use at least 14 characters.')
  if (!/[a-z]/.test(password)) failures.push('Include a lowercase letter.')
  if (!/[A-Z]/.test(password)) failures.push('Include an uppercase letter.')
  if (!/[0-9]/.test(password)) failures.push('Include a number.')
  if (!/[^A-Za-z0-9]/.test(password)) failures.push('Include a symbol.')

  const localPart = context.email?.split('@')[0]?.toLowerCase()
  if (localPart && localPart.length >= 4 && password.toLowerCase().includes(localPart)) {
    failures.push('Do not include the email name in the password.')
  }

  return { valid: failures.length === 0, failures }
}

export function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const symbols = '!#%?'
  const bytes = crypto.getRandomValues(new Uint8Array(20))
  const body = Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('')
  return `${body}${symbols[bytes[0] % symbols.length]}9aA`
}
