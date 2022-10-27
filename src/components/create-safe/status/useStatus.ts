import { type Dispatch, type SetStateAction, useState } from 'react'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'

const useStatus = (): [SafeCreationStatus, Dispatch<SetStateAction<SafeCreationStatus>>] => {
  const [status, setStatus] = useState<SafeCreationStatus>(SafeCreationStatus.AWAITING)

  return [status, setStatus]
}

export default useStatus
