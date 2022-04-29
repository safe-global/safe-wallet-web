import { useAppDispatch } from '@/store'
import { closeAllNotifications, closeNotification, enqueueNotification } from '@/store/notificationsSlice'
import type { NextPage } from 'next'
import { SnackbarKey } from 'notistack'
import { useState } from 'react'

const Home: NextPage = () => {
  const [persistentKey, setPersistentKey] = useState<SnackbarKey>('')
  const dispatch = useAppDispatch()

  const defaultNotification = () => {
    console.log('test')
    dispatch(enqueueNotification({ message: 'Default notification' }))
  }

  const persistentNotification = () => {
    const key = dispatch(
      enqueueNotification({
        message: 'Persistent notification, returning key',
        options: { variant: 'warning', persist: true },
      }),
    )

    console.log('Generated notification key:', key)
    setPersistentKey(key)
  }

  const closePersistent = () => {
    dispatch(closeNotification({ key: persistentKey }))
  }

  const closeAll = () => {
    dispatch(closeAllNotifications())
  }

  const deleteAll = () => {
    dispatch(closeAllNotifications())
  }

  return (
    <main>
      <h1>Hello web-core</h1>
      <br />
      <h3>Notification demo:</h3>
      <button onClick={defaultNotification}>Show default notification</button>
      <br />
      <button onClick={persistentNotification}>Show persistent notification</button>
      <br />
      <button onClick={closePersistent}>Close persistent notification</button>
      <br />
      <button onClick={closeAll}>Close all notifications</button>
      <br />
      <button onClick={deleteAll}>Delete all notifications</button>
    </main>
  )
}

export default Home
