import Safe from '@gnosis.pm/safe-core-sdk'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { PendingSafeData } from '@/components/create-safe'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { addOrUpdateSafe } from '@/store/addedSafesSlice'
import { defaultSafeInfo } from '@/store/safeInfoSlice'
import { Errors, logError } from '@/services/exceptions'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'

const useResolvePromise = ({
  creationPromise,
  setStatus,
  pendingSafe,
}: {
  creationPromise: Promise<Safe> | undefined
  setStatus: Dispatch<SetStateAction<SafeCreationStatus>>
  pendingSafe: PendingSafeData | undefined
}) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!creationPromise || !pendingSafe) return

    creationPromise
      .then((safe) => {
        setStatus(SafeCreationStatus.SUCCESS)

        dispatch(
          upsertAddressBookEntry({
            chainId: pendingSafe.chainId,
            address: safe.getAddress(),
            name: pendingSafe.name,
          }),
        )

        pendingSafe.owners.forEach((owner) => {
          dispatch(upsertAddressBookEntry({ chainId: pendingSafe.chainId, address: owner.address, name: owner.name }))
        })

        dispatch(
          addOrUpdateSafe({
            safe: {
              ...defaultSafeInfo,
              address: { value: safe.getAddress(), name: pendingSafe.name },
              threshold: pendingSafe.threshold,
              owners: pendingSafe.owners.map((owner) => ({
                value: owner.address,
                name: owner.name,
              })),
              chainId: pendingSafe.chainId,
              nonce: 0,
            },
          }),
        )
      })
      .catch((error: Error) => {
        setStatus(SafeCreationStatus.ERROR)
        logError(Errors._800, error.message)
      })
  }, [creationPromise, dispatch, pendingSafe, setStatus])
}

export default useResolvePromise
