// Be careful what you import here as it will increase the service worker bundle size

/// <reference lib="webworker" />

import { firebaseMessagingSw } from './firebase-messaging/firebase-messaging-sw'
import { mpcCoreKitServiceWorker } from './mpc-core-kit-sw'

firebaseMessagingSw()

mpcCoreKitServiceWorker()
