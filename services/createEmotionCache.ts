import createCache, { EmotionCache } from '@emotion/cache'

// prepend: true moves MUI styles to the top of the <head> so they're loaded first.
// It allows to easily override MUI styles with other styling solutions, like CSS modules.
export default function createEmotionCache(): EmotionCache {
  return createCache({ key: 'css', prepend: true })
}
