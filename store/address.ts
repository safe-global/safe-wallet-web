import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AddressStore = {
  addressBook: { id: string; shortName: string }[]
  updateAddress: (id: string, shortName: string) => void
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set) => ({
      addressBook: [{ id: 'llamapay', shortName: '1' }],
      updateAddress: (id: string, shortName: string) =>
        set((state) => {
          const isDuplicate = state.addressBook.find((p) => p.id === id)

          if (isDuplicate) {
            return {
              addressBook: state.addressBook.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      id,
                      shortName,
                    }
                  : item,
              ),
            }
          } else {
            return { addressBook: [...state.addressBook, { id, shortName }] }
          }
        }),
    }),
    {
      name: 'llama-address-book', // unique name
    },
  ),
)
