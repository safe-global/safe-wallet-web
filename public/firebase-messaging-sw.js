importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js')

const firebaseConfig = Object.fromEntries(new URL(location).searchParams.entries())

const app = firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging(app)

messaging.onBackgroundMessage((payload) => {
  const { title, body, image } = payload.notification

  self.registration.showNotification(title, {
    body,
    icon: image,
  })
})
