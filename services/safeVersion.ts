import { lt } from 'semver'

export const safeNeedsUpdate = (currentVersion?: string, latestVersion?: string): boolean => {
  if (!currentVersion || !latestVersion) {
    return false
  }

  return latestVersion ? lt(currentVersion, latestVersion) : false
}
