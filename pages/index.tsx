import { useAppDispatch } from '@/store'
import { closeAllNotifications, closeNotification, showNotification } from '@/store/notificationsSlice'
import type { NextPage } from 'next'
import { SnackbarKey } from 'notistack'
import { useState } from 'react'

const EXAMPLE_KEY = 'testNotificationkey'

const Home: NextPage = () => {
  const [persistentKey, setPersistentKey] = useState<SnackbarKey>('')
  const dispatch = useAppDispatch()

  const defaultNotification = () => {
    dispatch(showNotification({ message: 'Default notification' }))
  }

  const keyDefinedNotification = () => {
    dispatch(showNotification({ message: 'We set the key of this notification', options: { key: EXAMPLE_KEY } }))
  }

  const persistentNotification = () => {
    const key = dispatch(
      showNotification({
        message: 'Persistent notification, returning key',
        options: { variant: 'warning', persist: true },
      }),
    )

    console.log('Generated notification key:', key)
    setPersistentKey(key)
  }

  const closeKey = (key: SnackbarKey) => {
    dispatch(closeNotification({ key }))
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
      <button onClick={keyDefinedNotification}>Show key-defined notification</button>
      <br />
      <button onClick={() => closeKey(EXAMPLE_KEY)}>Close key-defined notification</button>
      <br />
      <button onClick={persistentNotification}>Show persistent notification</button>
      <br />
      <button onClick={() => closeKey(persistentKey)}>Close persistent notification</button>
      <br />
      <button onClick={closeAll}>Close all notifications</button>
      <br />
      <button onClick={deleteAll}>Delete all notifications</button>
    </main>
  )
}

export default Home
