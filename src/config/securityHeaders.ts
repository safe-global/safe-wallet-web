import { IS_PRODUCTION } from '@/config/constants'

/**
 * CSP Header notes:
 * For safe apps we have to allow img-src * and frame-src *
 * connect-src * because the RPCs are configurable (config service)
 * style-src unsafe-inline for our styled components
 * script-src unsafe-eval is needed by next.js in dev mode, otherwise only self
 * frame-ancestors can not be set via meta tag
 */
export const ContentSecurityPolicy = `
 default-src 'self';
 connect-src 'self' *;
 script-src 'self' https://www.googletagmanager.com ${!IS_PRODUCTION ? "'unsafe-eval'" : ''};
 frame-src *;
 style-src 'self' 'unsafe-inline';
 font-src 'self' data:; 
 img-src * data:;
`
  .replace(/\s{2,}/g, ' ')
  .trim()

export const XFrameOptions = 'DENY'

export const StrictTransportSecurity = 'max-age=31536000; includeSubDomains'
