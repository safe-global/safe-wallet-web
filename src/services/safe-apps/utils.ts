export function isIframe() {
  return typeof window !== undefined && window.top !== window.self
}
