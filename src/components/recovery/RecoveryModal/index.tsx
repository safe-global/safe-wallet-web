import { Backdrop, Fade } from '@mui/material'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { ReactElement, ReactNode } from 'react'

import { useRecoveryQueue } from '@/hooks/useRecoveryQueue'
import { RecoveryInProgress } from './RecoveryInProgress'
import { RecoveryProposal } from './RecoveryProposal'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { useIsGuardian } from '@/hooks/useIsGuardian'
import madProps from '@/utils/mad-props'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

import css from './styles.module.css'

export function _RecoveryModal({
  children,
  isOwner,
  isGuardian,
  queue,
}: {
  children: ReactNode
  isOwner: boolean
  isGuardian: boolean
  queue: Array<RecoveryQueueItem>
}): ReactElement {
  const [modal, setModal] = useState<ReactElement | null>(null)
  const router = useRouter()

  const next = queue[0]

  const onClose = () => {
    setModal(null)
  }

  // Trigger modal
  useEffect(() => {
    setModal(() => {
      if (next) {
        return <RecoveryInProgress onClose={onClose} recovery={next} />
      }
      if (isGuardian && queue.length === 0) {
        return <RecoveryProposal onClose={onClose} />
      }
      return null
    })
  }, [queue.length, isOwner, isGuardian, next])

  // Close modal on navigation
  useEffect(() => {
    router.events.on('routeChangeComplete', onClose)
    return () => {
      router.events.off('routeChangeComplete', onClose)
    }
  }, [router])

  return (
    <>
      <Fade in={!!modal}>
        <Backdrop open={!!modal} className={css.backdrop}>
          {modal}
        </Backdrop>
      </Fade>
      {children}
    </>
  )
}

export const RecoveryModal = madProps(_RecoveryModal, {
  isOwner: useIsSafeOwner,
  isGuardian: useIsGuardian,
  queue: useRecoveryQueue,
})
