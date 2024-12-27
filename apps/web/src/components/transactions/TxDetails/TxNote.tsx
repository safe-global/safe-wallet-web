import { Tooltip, Typography } from '@mui/material'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'
import InfoIcon from '@/public/images/notifications/info.svg'

function useTxNote(txDetails: TransactionDetails | undefined): string | undefined {
  const currentChain = useCurrentChain()
  const txService = currentChain?.transactionService

  let safeTxHash = ''
  if (txDetails && isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)) {
    safeTxHash = txDetails.detailedExecutionInfo?.safeTxHash
  }

  const [data] = useAsync(() => {
    if (!safeTxHash || !txService) return
    return fetch(`${txService}/api/v1/multisig-transactions/${safeTxHash}`).then((res) => res.json())
  }, [safeTxHash, txService])

  let note: string | undefined
  if (data) {
    try {
      const origin = JSON.parse(data.origin)
      const parsedName = JSON.parse(origin.name)
      if (typeof parsedName.note === 'string') {
        note = parsedName.note
      }
    } catch {
      // Ignore, no note
    }
  }

  return note
}

const TxNote = ({ txDetails }: { txDetails: TransactionDetails | undefined }) => {
  const note = useTxNote(txDetails)

  return note ? (
    <div>
      <Typography variant="h5" display="flex" alignItems="center" justifyItems="center">
        Note
        <Tooltip title="This note is left by the transaction creator." arrow>
          <Typography color="text.secondary" component="span" height="1em">
            <InfoIcon height="1em" />
          </Typography>
        </Tooltip>
      </Typography>

      <Typography p={2} mt={1} borderRadius={1} bgcolor="background.main">
        {note}
      </Typography>
    </div>
  ) : null
}

export default TxNote
