import { CreateSafeOnNewChain } from '@/features/multichain/components/CreateSafeOnNewChain'
import { Button } from '@mui/material'
import { useState } from 'react'

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
        + Add another network
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
