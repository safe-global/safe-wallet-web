import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { AlertColor } from '@mui/material'
import type { AppThunk, RootState } from '@/store'

export type Notification = {
  id: string
  message: string
  groupKey: string
  variant?: AlertColor
  dismissed?: boolean
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
    closeNotification: (state, { payload }: PayloadAction<{ id: string }>): NotificationState => {
      return state.map((notification) => {
        return notification.id === payload.id ? { ...notification, dismissed: true } : notification
      })
    },
    closeAllNotifications: (state): NotificationState => {
      return state.map((notification) => ({ ...notification, dismissed: true }))
    },
    deleteNotification: (state, { payload }: PayloadAction<Notification>) => {
      return state.filter((notification) => notification.id !== payload.id)
    },
    deleteAllNotifications: (): NotificationState => {
      return []
    },
  },
})

export const { closeNotification, closeAllNotifications, deleteNotification, deleteAllNotifications } =
  notificationsSlice.actions

export const showNotification = (payload: Omit<Notification, 'id'>): AppThunk<string> => {
  return (dispatch) => {
    const id = Math.random().toString(32).slice(2)

    const notification: Notification = {
      ...payload,
      id,
    }

    dispatch(notificationsSlice.actions.enqueueNotification(notification))

    return id
  }
}

export const selectNotifications = (state: RootState): NotificationState => {
  return state[notificationsSlice.name]
}
