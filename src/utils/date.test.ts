import timezoneMock from 'timezone-mock'
import { currentMinutes, formatDateTime, formatTime, getCountdown, getPeriod } from './date'

const MOCKED_TIMESTAMP = 1729506116962

describe('Date utils', () => {
  beforeAll(() => {
    timezoneMock.register('Etc/GMT-2')
    jest.spyOn(Date, 'now').mockImplementation(() => MOCKED_TIMESTAMP)
  })

  it('should show the date in minutes', () => {
    expect(currentMinutes()).toBe(28825101)
  })

  it('should format the date time based in a timestamp', () => {
    expect(formatTime(MOCKED_TIMESTAMP)).toBe('12:21 PM')
  })

  it('should format the date based in a timestamp', () => {
    expect(formatDateTime(MOCKED_TIMESTAMP)).toBe('Oct 21, 2024 - 12:21:56 PM')
  })

  it('should return a countdown object', () => {
    expect(getCountdown(20000)).toStrictEqual({
      days: 0,
      hours: 5,
      minutes: 33,
    })
  })

  it('should get the time period in hours from seconds', () => {
    expect(getPeriod(20000)).toBe('5 hours')
  })

  it('should get the time period in minutes from seconds', () => {
    expect(getPeriod(2000)).toBe('33 minutes')
  })

  it('should get the time period in days from seconds', () => {
    expect(getPeriod(2000000)).toBe('23 days')
  })
})
