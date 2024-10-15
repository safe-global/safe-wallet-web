// unit tests for getUpdatedUserActivity

import { getUpdatedUserActivity } from '../getUpdatedUserActivity'

describe('getUpdatedUserActivity', () => {
  it('should return an array with the current timestamp if the activityTimestamps array is empty', () => {
    const result = getUpdatedUserActivity([])
    expect(result).toHaveLength(1)
    expect(result[0]).toBeCloseTo(new Date().getTime(), -2)
  })

  it('should return the existing timestamp array unchanged if the last timestamp is less than 1 hour ago', () => {
    const timestamps = [new Date().getTime() - 1000 * 60 * 30]
    const result = getUpdatedUserActivity(timestamps)
    expect(result).toEqual(timestamps)
  })

  it('should return an array with the current timestamp appended if the last timestamp is more than 1 hour ago', () => {
    const timestamps = [new Date().getTime() - 1000 * 60 * 60 * 24]
    const result = getUpdatedUserActivity(timestamps)
    expect(result).toEqual([...timestamps, new Date().getTime()])
  })
})
