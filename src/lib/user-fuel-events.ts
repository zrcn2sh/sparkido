export const USER_FUEL_CHANGED_EVENT = 'sparkido:user-fuel-changed'

export function dispatchUserFuelChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(USER_FUEL_CHANGED_EVENT))
}
