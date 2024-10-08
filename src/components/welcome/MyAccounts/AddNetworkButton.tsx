import Track from '@/components/common/Track'
import { CreateSafeOnNewChain } from '@/features/multichain/components/CreateSafeOnNewChain'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { Button } from '@mui/material'
import { useState } from 'react'
import PlusIcon from '@/public/images/common/plus.svg'

export const AddNetworkButton = ({
  safeAddress,
  deployedChains,
}: {
  safeAddress: string
  deployedChains: string[]
}) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Track {...OVERVIEW_EVENTS.ADD_NEW_NETWORK} label={OVERVIEW_LABELS.sidebar}>
        <Button variant="text" fullWidth onClick={() => setOpen(true)}>
          <PlusIcon /> Add another network
        </Button>
      </Track>

      {open && (
        <CreateSafeOnNewChain
          open={open}
          onClose={() => setOpen(false)}
          safeAddress={safeAddress}
          deployedChainIds={deployedChains}
        />
      )}
    </>
  )
}
