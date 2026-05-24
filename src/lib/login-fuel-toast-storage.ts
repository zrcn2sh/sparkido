const PREFIX = 'sparkido:login-fuel-toast:'

export function isLoginFuelToastDismissed(ledgerId: string): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(`${PREFIX}${ledgerId}`) === '1'
}

export function dismissLoginFuelToast(ledgerId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${PREFIX}${ledgerId}`, '1')
}
