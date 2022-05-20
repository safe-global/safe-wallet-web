import { valid, lt } from 'semver'

export const safeNeedsUpdate = (currentVersion?: string, latestVersion?: string): boolean => {
  if (!currentVersion || !latestVersion) {
    return false
  }
  const current = valid(currentVersion) as string
  const latest = valid(latestVersion) as string

  return latest ? lt(current, latest) : false
}
