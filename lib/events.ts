/**
 * Tiny typed event bus for cross-component signaling.
 * Used to break tight coupling between screens and root layout.
 *
 * Example:  appEvents.emit('onboardingCompleted')
 *           appEvents.on('onboardingCompleted', handler)
 */

type EventMap = {
  onboardingCompleted: void
  applicationStatusChanged: void
  forceSignOut: void
}

const listeners = new Map<keyof EventMap, Set<() => void>>()

export const appEvents = {
  on(event: keyof EventMap, handler: () => void) {
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event)!.add(handler)
    return () => { listeners.get(event)?.delete(handler) }
  },

  emit(event: keyof EventMap) {
    listeners.get(event)?.forEach(fn => fn())
  },
}
