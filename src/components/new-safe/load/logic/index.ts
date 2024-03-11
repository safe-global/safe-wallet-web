import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { AppDispatch } from '@/store'
import { addOrUpdateSafe } from '@/store/addedSafesSlice'
import { defaultSafeInfo } from '@/store/safeInfoSlice'

export const addSafeToWatchlist = (dispatch: AppDispatch, safe: SafeInfo, safeName: string) => {
  // Add safe to watchlist
  dispatch(
    addOrUpdateSafe({
      safe: {
        ...defaultSafeInfo,
        address: { value: safe.address.value },
        threshold: safe.threshold,
        owners: safe.owners.map((owner) => ({
          value: owner.value,
          name: owner.name,
        })),
        chainId: safe.chainId,
      },
    }),
  )

  // Add safe to address book
  // dispatch(
  //   upsertAddressBookEntry({
  //     chainId: safe.chainId,
  //     address: safe.address.value,
  //     name: safeName,
  //   }),
  // )

  // Add all owners of the safe to address book
  // for (const [index, { value }] of safe.owners.entries()) {
  //   dispatch(
  //     upsertAddressBookEntry({
  //       chainId: safe.chainId,
  //       address: value,
  //       name: '',
  //     }),
  //   )
  // }
}
