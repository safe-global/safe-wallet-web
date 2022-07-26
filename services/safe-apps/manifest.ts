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

const fetchAppManifest = async (appUrl: string) => {
  const normalizedUrl = trimTrailingSlash(appUrl)
  const manifestUrl = `${normalizedUrl}/manifest.json`
  const response = await fetch(manifestUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch manifest from ${manifestUrl}`)
  }

  return response.json()
}

const isAppManifestValid = (json: unknown): json is AppManifest => {
  return json != null && typeof json === 'object' && 'name' in json && 'description' in json && 'icons' in json
}

export { fetchAppManifest, isAppManifestValid }
