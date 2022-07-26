import { trimTrailingSlash } from '@/utils/url'

type AppManifestIcon = {
  src: string
  sizes: string
  type?: string
  purpose?: string
}

export type AppManifest = {
  // SPEC: https://developer.mozilla.org/en-US/docs/Web/Manifest
  name: string
  short_name?: string
  description: string
  icons: AppManifestIcon[]
  // `iconPath` a former custom property for Safe Apps, we now use `icons`
  iconPath?: string
}

const fetchAppManifest = async (appUrl: string, timeout = 5000): Promise<unknown> => {
  const normalizedUrl = trimTrailingSlash(appUrl)
  const manifestUrl = `${normalizedUrl}/manifest.json`

  // A lot of apps are hosted on IPFS and IPFS never times out, so we add our own timeout
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  const response = await fetch(manifestUrl, {
    signal: controller.signal,
  })
  clearTimeout(id)

  if (!response.ok) {
    throw new Error(`Failed to fetch manifest from ${manifestUrl}`)
  }

  return response.json()
}

const isAppManifestValid = (json: unknown): json is AppManifest => {
  return json != null && typeof json === 'object' && 'name' in json && 'description' in json && 'icons' in json
}

export { fetchAppManifest, isAppManifestValid }
