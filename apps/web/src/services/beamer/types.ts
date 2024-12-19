export type BeamerConfig = {
  product_id: string
  selector?: string
  display?: 'left' | 'right' | 'popup' | 'in-app'
  display_position?: string
  top?: number
  right?: number
  bottom?: number
  left?: number
  embed?: boolean
  button?: boolean
  button_position?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'
  icon?: 'bell_full' | 'bell_lines' | 'flame' | 'flame_alt' | 'alert_bubble' | 'alert_circle' | 'bullhorn' | 'thumbtack'
  bounce?: boolean
  notification_prompt?: 'sidebar' | 'popup'
  notification_prompt_delay?: number
  language?: string
  filter?: string
  force_filter?: string
  filter_by_url?: boolean
  mobile?: boolean
  lazy?: boolean
  alert?: boolean
  force_button?: boolean
  counter?: boolean
  first_visit_unread?: number
  standalone?: boolean
  post_request?: boolean
  delay?: number
  callback?: (url: string, openInNewWindow: boolean) => boolean
  onclick?: (url: string, openInNewWindow: boolean) => boolean
  onopen?: () => boolean
  onclose?: () => boolean
  onerror?: () => unknown
  user_firstname?: string
  user_lastname?: string
  user_email?: string
  user_id?: string
  multi_user?: boolean
  nps_delay?: number
  user_created_at?: number | string
}

export type BeamerMethods = {
  init: () => void
  show: () => void
  hide: () => void
  update: (params: BeamerConfig) => void
  destroy: () => void
}
