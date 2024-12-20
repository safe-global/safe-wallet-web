export const category = 'push-notifications'

export const PUSH_NOTIFICATION_EVENTS = {
  // Browser notification shown to user
  SHOW_NOTIFICATION: {
    action: 'Show notification',
    category,
  },
  // User opened on notification
  OPEN_NOTIFICATION: {
    action: 'Open notification',
    category,
  },
  // User registered Safe(s) for notifications
  REGISTER_SAFES: {
    action: 'Register Safe(s) notifications',
    category,
  },
  // User unregistered Safe from notifications
  UNREGISTER_SAFE: {
    action: 'Unregister Safe notifications',
    category,
  },
  // User unregistered device from notifications
  UNREGISTER_DEVICE: {
    action: 'Unregister device notifications',
    category,
  },
  // Notification banner shown
  SHOW_BANNER: {
    action: 'Show notification banner',
    category,
  },
  // User dismissed notfication banner
  DISMISS_BANNER: {
    action: 'Dismiss notification banner',
    category,
  },
  // User enabled all notifications from banner
  ENABLE_ALL: {
    action: 'Enable all notifications',
    category,
  },
  // User opened Safe notification settings from banner
  CUSTOMIZE_SETTINGS: {
    action: 'Customize notifications',
    category,
  },
  // User turned notifications on for a Safe from settings
  ENABLE_SAFE: {
    action: 'Turn notifications on',
    category,
  },
  // User turned notifications off for a Safe from settings
  DISABLE_SAFE: {
    action: 'Turn notifications off',
    category,
  },
  // Save button clicked in global notification settings
  SAVE_SETTINGS: {
    action: 'Save notification settings',
    category,
  },
  // User changed the incoming transactions notifications setting
  // (incoming native currency/tokens)
  TOGGLE_INCOMING_TXS: {
    action: 'Toggle incoming transactions notifications',
    category,
  },
  // User changed the outgoing transactions notifications setting
  // (module/executed multisig transactions)
  TOGGLE_OUTGOING_TXS: {
    action: 'Toggle outgoing assets notifications',
    category,
  },
  // User changed the confirmation request notifications setting
  TOGGLE_CONFIRMATION_REQUEST: {
    action: 'Toggle confirmation request notifications',
    category,
  },
}
