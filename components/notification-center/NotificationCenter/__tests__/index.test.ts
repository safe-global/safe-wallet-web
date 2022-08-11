import { NotificationState } from '@/store/notificationsSlice'
import { _getSortedNotifications } from '..'

const UNREAD_ACTION_NOTIFICATION = {
  isRead: undefined,
  link: {},
} as NotificationState[number]

const UNREAD_NOTIFICATION = {
  isRead: undefined,
} as NotificationState[number]

const READ_ACTION_NOTIFICATION = {
  isRead: true,
  link: {},
} as NotificationState[number]

const READ_NOTIFICATION = {
  isRead: true,
} as NotificationState[number]

describe('Notifications', () => {
  describe('getSortedNotifications', () => {
    it("should't sort correctly ordered notifications", () => {
      const notifications = [
        { ...UNREAD_ACTION_NOTIFICATION, timestamp: 6 },
        { ...UNREAD_ACTION_NOTIFICATION, timestamp: 5 },
        { ...UNREAD_NOTIFICATION, timestamp: 4 },
        { ...UNREAD_NOTIFICATION, timestamp: 3 },
        { ...READ_ACTION_NOTIFICATION, timestamp: 2 },
        { ...READ_NOTIFICATION, timestamp: 1 },
      ]
      expect(_getSortedNotifications(notifications)).toEqual(notifications)
    })

    it('should sort the read notifications chronologically regardless of action', () => {
      const notifications = [
        { ...READ_NOTIFICATION, timestamp: 1 },
        { ...READ_NOTIFICATION, timestamp: 2 },
        { ...READ_ACTION_NOTIFICATION, timestamp: 3 },
        { ...READ_NOTIFICATION, timestamp: 4 },
      ]

      const sortedNotifications = [
        { ...READ_NOTIFICATION, timestamp: 4 },
        { ...READ_ACTION_NOTIFICATION, timestamp: 3 },
        { ...READ_NOTIFICATION, timestamp: 2 },
        { ...READ_NOTIFICATION, timestamp: 1 },
      ]

      expect(_getSortedNotifications(notifications)).toEqual(sortedNotifications)
    })

    it('should sort unread actionable notifications to the top', () => {
      const notifications = [
        { ...READ_ACTION_NOTIFICATION, timestamp: 3 },
        { ...READ_NOTIFICATION, timestamp: 2 },
        { ...UNREAD_ACTION_NOTIFICATION, timestamp: 1 },
      ]

      const sortedNotifications = [
        { ...UNREAD_ACTION_NOTIFICATION, timestamp: 1 },
        { ...READ_ACTION_NOTIFICATION, timestamp: 3 },
        { ...READ_NOTIFICATION, timestamp: 2 },
      ]
      expect(_getSortedNotifications(notifications)).toEqual(sortedNotifications)
    })
    it('should sort unread notifications to the top', () => {
      const notifications = [
        { ...READ_ACTION_NOTIFICATION, timestamp: 3 },
        { ...READ_NOTIFICATION, timestamp: 3 },
        { ...UNREAD_NOTIFICATION, timestamp: 1 },
      ]

      const sortedNotifications = [
        { ...UNREAD_NOTIFICATION, timestamp: 1 },
        { ...READ_ACTION_NOTIFICATION, timestamp: 3 },
        { ...READ_NOTIFICATION, timestamp: 3 },
      ]

      expect(_getSortedNotifications(notifications)).toEqual(sortedNotifications)
    })
    it('should sort actionable notifications to the top, followed by unread notifications', () => {
      const notifications = [
        { ...READ_ACTION_NOTIFICATION, timestamp: 4 },
        { ...READ_NOTIFICATION, timestamp: 3 },
        { ...UNREAD_NOTIFICATION, timestamp: 2 },
        { ...UNREAD_ACTION_NOTIFICATION, timestamp: 1 },
      ]

      const sortedNotifications = [
        { ...UNREAD_ACTION_NOTIFICATION, timestamp: 1 },
        { ...UNREAD_NOTIFICATION, timestamp: 2 },
        { ...READ_ACTION_NOTIFICATION, timestamp: 4 },
        { ...READ_NOTIFICATION, timestamp: 3 },
      ]

      expect(_getSortedNotifications(notifications)).toEqual(sortedNotifications)
    })
  })
})
