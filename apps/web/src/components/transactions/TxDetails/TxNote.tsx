import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'
import { Box, Divider, Typography } from '@mui/material'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'

const TxNote = ({ txDetails }: { txDetails: TransactionDetails }) => {
  const currentChain = useCurrentChain()
  const txService = currentChain?.transactionService

  let safeTxHash = ''
  if (isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)) {
    safeTxHash = txDetails.detailedExecutionInfo?.safeTxHash
  }

  const [data] = useAsync(() => {
    if (!safeTxHash || !txService) return
    return fetch(`${txService}/api/v1/multisig-transactions/${safeTxHash}`).then((res) => res.json())
  }, [safeTxHash, txService])

  let note = ''
  if (data) {
    try {
      const origin = JSON.parse(data.origin)
      const parsedName = JSON.parse(origin.name)
      note = parsedName.note
    } catch {
      // Ignore, no note
    }
  }

  return note ? (
    <>
      <Box my={1} mx={2} py={1}>
        <Typography variant="h5">Description</Typography>

        <Typography p={2} mt={1} borderRadius={1} bgcolor="background.main">
          {note}
        </Typography>
      </Box>

      <Divider />
    </>
  ) : null
}

export default TxNote
