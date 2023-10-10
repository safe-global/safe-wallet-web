import { Typography } from '@mui/material'
import { useContext, useEffect, useMemo } from 'react'
import type { ReactElement } from 'react'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import EthHashInfo from '@/components/common/EthHashInfo'
import { Errors, logError } from '@/services/exceptions'
import { createMultiSendCallOnlyTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { getRecoverySetup } from '@/services/recovery/setup'
import { useWeb3 } from '@/hooks/wallets/web3'
import useSafeInfo from '@/hooks/useSafeInfo'

export function ReviewEnableRecovery({ recoverers }: { recoverers: Array<string> }): ReactElement {
  const web3 = useWeb3()
  const { safe, safeAddress } = useSafeInfo()
  const { setSafeTx, safeTxError, setSafeTxError } = useContext(SafeTxContext)

  const recovery = useMemo(() => {
    if (!web3) {
      return
    }

    return getRecoverySetup({
      txCooldown: '0',
      txExpiration: '0',
      recoverers,
      safe,
      provider: web3,
    })
  }, [recoverers, safe, web3])

  useEffect(() => {
    if (recovery) {
      createMultiSendCallOnlyTx(recovery.transactions).then(setSafeTx).catch(setSafeTxError)
    }
  }, [recovery, setSafeTx, setSafeTxError])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._809, safeTxError.message)
    }
  }, [safeTxError])

  const onSubmit = async () => {
    if (!recovery) {
      return
    }

    // TODO: Proxy
    const ACCOUNT = ''
    const PROJECT = ''
    const API_KEY = ''

    const URL = `https://api.tenderly.co/api/v2/accounts/${ACCOUNT}/projects/${PROJECT}/contracts`

    fetch(URL, {
      method: 'POST',
      body: JSON.stringify({
        contracts: [
          {
            address: recovery.expectedModuleAddress,
            display_name: `Delay Modifier for ${safeAddress}`,
            network_id: safe.chainId,
          },
        ],
      }),
      headers: {
        'X-Access-Key': API_KEY,
      },
    })
  }

  return (
    <SignOrExecuteForm onSubmit={onSubmit}>
      <Typography sx={({ palette }) => ({ color: palette.primary.light })}>Recovery module</Typography>

      <EthHashInfo address={recovery?.expectedModuleAddress ?? ''} showCopyButton hasExplorer shortAddress={false} />

      {/* TODO: List recoverers */}

      <Typography my={2}>
        The recovery module will be deployed, enabled on the Safe and have recoverers added to it.
      </Typography>
    </SignOrExecuteForm>
  )
}
