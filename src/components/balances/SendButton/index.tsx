import { type ReactElement, useContext } from 'react'
import { Button } from '@mui/material'
import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import { ASSETS_EVENTS } from '@/services/analytics'
import { TxModalContext } from '@/components/tx-flow'
import TokenTransferFlow from '@/components/tx-flow/flows/TokenTransfer'

const SendButton = ({ tokenAddresses }: { tokenAddresses: string[] }): ReactElement => {
  const { setTxFlow } = useContext(TxModalContext)
  //const spendingLimits = useSelector(selectSpendingLimits)

  return (
    <CheckWallet allowSpendingLimit={true}>
      {(isOk) => (
        <Track {...ASSETS_EVENTS.SEND}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ ml: 2, py: '11.25px', minWidth: '10.5em' }}
            onClick={(e) => {
              e.preventDefault()

              if (tokenAddresses.length > 0) {
                setTxFlow(<TokenTransferFlow tokenAddress={tokenAddresses[0]} />)
              }
            }}
            disabled={!isOk || tokenAddresses.length === 0}
          >
            Send
            {tokenAddresses.length > 0 ? ' ' + tokenAddresses.length : ''}
            {' token' + (tokenAddresses.length === 1 ? '' : 's')}
          </Button>
        </Track>
      )}
    </CheckWallet>
  )
}

export default SendButton
