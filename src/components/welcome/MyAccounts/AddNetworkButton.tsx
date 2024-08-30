import { CreateSafeOnNewChain } from '@/features/multichain/components/CreateSafeOnNewChain'
import { Button } from '@mui/material'
import { useState } from 'react'
import PlusIcon from '@/public/images/common/plus.svg'

export const AddNetworkButton = ({
  safeAddress,
  currentName,
  deployedChains,
}: {
  safeAddress: string
  currentName: string | undefined
  deployedChains: string[]
}) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="text" fullWidth onClick={() => setOpen(true)}>
        <PlusIcon /> Add another network
      </Button>

      {open && (
        <CreateSafeOnNewChain
          open={open}
          onClose={() => setOpen(false)}
          currentName={currentName}
          safeAddress={safeAddress}
          deployedChainIds={deployedChains}
        />
      )}
    </>
  )
}
