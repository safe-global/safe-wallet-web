import type { ReactElement } from 'react'
import { Fragment, useEffect, useRef } from 'react'
import { trackEvent, type EventLabel } from '@/services/analytics'

type Props = {
  children: ReactElement
  as?: 'span' | 'div'
  category: string
  action: string
  label?: EventLabel
}

const Track = ({ children, as: Wrapper = 'span', ...trackData }: Props): typeof children => {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!el.current) {
      return
    }

    const trackEl = el.current

    const handleClick = () => {
      trackEvent(trackData)
    }

    // We cannot use onClick as events in children do not always bubble up
    trackEl.addEventListener('click', handleClick)
    return () => {
      trackEl.removeEventListener('click', handleClick)
    }
  }, [el, trackData])

  if (children.type === Fragment) {
    throw new Error('Fragments cannot be tracked.')
  }

  return (
    <Wrapper data-track={`${trackData.category}: ${trackData.action}`} ref={el}>
      {children}
    </Wrapper>
  )
}

export default Track
