import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack'

import type { AppDispatch, RootState } from '@/store'

type Notification = {
  message: SnackbarMessage
  dismissed?: boolean
  options?: OptionsObject
}

type NotificationState = Notification[]

const initialState: NotificationState = []

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    enqueueNotification: (state, { payload }: PayloadAction<Notification>): NotificationState => {
      return [...state, payload]
    },
    closeNotification: (state, { payload }: PayloadAction<{ key: SnackbarKey }>): NotificationState => {
      return state.map((notification) => {
        return notification.options?.key === payload.key ? { ...notification, dismissed: true } : notification
      })
    },
    closeAllNotifications: (state): NotificationState => {
      return state.map((notification) => ({ ...notification, dismissed: true }))
    },
    deleteNotification: (state, { payload }: PayloadAction<{ key: SnackbarKey }>) => {
      return state.filter((notification) => notification.options?.key !== payload.key)
    },
    deleteAllNotifications: (): NotificationState => {
      return []
    },
  },
})

export const { closeNotification, closeAllNotifications, deleteNotification, deleteAllNotifications } =
  notificationsSlice.actions

// Custom thunk that returns the key in case it was auto-generated
export const showNotification = (payload: Pick<Notification, 'message' | 'options'>) => {
  return (dispatch: AppDispatch): SnackbarKey => {
    {
      const key = payload.options?.key || new Date().getTime() + Math.random()

      const notification: Notification = {
        ...payload,
        options: { ...payload.options, key },
      }

      dispatch(notificationsSlice.actions.enqueueNotification(notification))

      return key
    }
  }
}

export const selectNotifications = (state: RootState): NotificationState => {
  return state[notificationsSlice.name]
}
