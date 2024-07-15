import { SAFE_DOMAINS } from '@/config/constants'

export function isIframe() {
  return typeof window !== undefined && window.top !== window.self
}

export function isNestedSafe(url: string) {
  const { host } = new URL(url)
  const isNestedSafe = SAFE_DOMAINS.some((domain) => host.includes(domain))
  return isNestedSafe
}
