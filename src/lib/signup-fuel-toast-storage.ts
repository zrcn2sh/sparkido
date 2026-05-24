const PREFIX = 'sparkido:signup-fuel-toast:'

export function isSignupFuelToastDismissed(ledgerId: string): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(`${PREFIX}${ledgerId}`) === '1'
}

export function dismissSignupFuelToast(ledgerId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${PREFIX}${ledgerId}`, '1')
}
