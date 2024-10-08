export const getUpdatedUserActivity = (activityTimestamps: number[] | undefined) => {
  const currentTime = new Date().getTime()

  if (!activityTimestamps) {
    return [currentTime]
  }

  const lastTimestamp = activityTimestamps[activityTimestamps.length - 1]
  const timeSinceLastVisit = currentTime - lastTimestamp
  // Do not log a new visit if last timestamp was less than 1 hour ago.
  if (timeSinceLastVisit < 60 * 60 * 1000) {
    return activityTimestamps
  }

  return [...activityTimestamps, currentTime]
}
