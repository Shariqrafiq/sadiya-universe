// Tiny Web Audio sound effects. Only plays after a user gesture and if sound is enabled.
let ctx: AudioContext | null = null
export function soundEnabled(): boolean {
  try { return localStorage.getItem('sound') !== 'off' } catch { return true }
}
export function setSoundEnabled(on: boolean) {
  try { localStorage.setItem('sound', on ? 'on' : 'off') } catch { /* ignore */ }
}
export function blip(freq = 660, dur = 0.15, type: OscillatorType = 'sine') {
  if (!soundEnabled()) return
  try {
    ctx ??= new AudioContext()
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.type = type; o.frequency.value = freq
    g.gain.setValueAtTime(0.08, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur)
  } catch { /* audio unavailable */ }
}
export const chime = () => { blip(660); setTimeout(() => blip(880), 110); setTimeout(() => blip(1100), 220) }
