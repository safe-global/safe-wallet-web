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
  const manifestUrl = `${appUrl}/manifest.json`

  return await fetch(manifestUrl).then((res) => res.json())
}

const isAppManifestValid = (json: unknown): json is AppManifest => {
  return json != null && typeof json === 'object' && 'name' in json && 'description' in json && 'icons' in json
}

export { fetchAppManifest, isAppManifestValid }
