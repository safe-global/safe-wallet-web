import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/services/useSafeInfo'
import { Box, Divider, Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import { ChangeOwnerData } from '@/components/settings/owner/DialogSteps/data'
import { useSafeSDK } from '@/services/safe-core/safeCoreSDK'
import { createTx } from '@/services/tx/txSender'
import useAsync from '@/services/useAsync'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { useState } from 'react'
import { useAppDispatch } from '@/store'
import NonceForm from '@/components/tx/steps/ReviewNewTx/NonceForm'
import useSafeTxGas from '@/services/useSafeTxGas'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useChainId from '@/services/useChainId'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { sameAddress } from '@/services/addresses'

export const ReviewOwnerTxStep = ({ data, onSubmit }: { data: ChangeOwnerData; onSubmit: (data: null) => void }) => {
  const { safe } = useSafeInfo()
  const chainId = useChainId()
  const dispatch = useAppDispatch()
  const safeSDK = useSafeSDK()
  const { newOwner, removedOwner, threshold } = data

  const [editableNonce, setEditableNonce] = useState<number>()

  const [changeOwnerTx, createTxError, loading] = useAsync(() => {
    if (!safeSDK) {
      throw new Error('Safe SDK not initialized')
    }
    if (removedOwner) {
      return safeSDK.getSwapOwnerTx({
        newOwnerAddress: newOwner.address,
        oldOwnerAddress: removedOwner.address,
      })
    } else {
      return safeSDK.getAddOwnerTx({
        ownerAddress: newOwner.address,
        threshold,
      })
    }
  }, [removedOwner, newOwner])

  const { safeGas, safeGasError, safeGasLoading } = useSafeTxGas(changeOwnerTx?.data)

  const [safeTx, safeTxError, safeTxLoading] = useAsync<SafeTransaction | undefined>(async () => {
    if (changeOwnerTx) {
      return await createTx({
        ...changeOwnerTx.data,
        nonce: editableNonce,
        safeTxGas: safeGas ? Number(safeGas.safeTxGas) : undefined,
      })
    }
  }, [editableNonce, changeOwnerTx, safeGas?.safeTxGas])

  const isReplace = Boolean(removedOwner)

  const addAddressBookEntryAndSubmit = (data: null) => {
    if (typeof newOwner.name !== 'undefined') {
      dispatch(
        upsertAddressBookEntry({
          chainId: chainId,
          address: newOwner.address,
          name: newOwner.name,
        }),
      )
    }

    onSubmit(data)
  }

  // All errors
  const txError = safeTxError || safeGasError || createTxError

  return (
    <div className={css.container}>
      <Typography variant="h6">Review transaction</Typography>
      <Grid container spacing={2} style={{ paddingLeft: '24px', paddingTop: '20px' }}>
        <Grid direction="column" xs item className={`${css.detailsBlock}`}>
          <Typography>Details</Typography>
          <Box marginBottom={2}>
            <Typography>Safe name:</Typography>
            {/* TODO: SafeName */}
            <Typography>Name Placeholder</Typography>
          </Box>
          <Box marginBottom={2}>
            <Typography>Any transaction requires the confirmation of:</Typography>
            <Typography>
              <b>{threshold}</b> out of <b>{(safe?.owners.length ?? 0) + (isReplace ? 0 : 1)}</b> owners
            </Typography>
          </Box>
        </Grid>
        <Grid direction="column">
          <Typography paddingLeft={2}>{safe?.owners.length ?? 0} Safe owner(s)</Typography>
          <Divider />
          {safe?.owners
            .filter((owner) => !removedOwner || !sameAddress(owner.value, removedOwner.address))
            .map((owner) => (
              <div key={owner.value}>
                <Box padding={2} key={owner.value}>
                  <EthHashInfo address={owner.value} shortAddress={false} />
                </Box>
                <Divider />
              </div>
            ))}
          {removedOwner && (
            <>
              <div className={css.info}>
                <Typography className={css.overline}>REMOVING OWNER &darr;</Typography>
              </div>
              <Divider />
              <Box className={css.removedOwner} padding={2}>
                <EthHashInfo address={removedOwner.address} shortAddress={false} />
              </Box>
              <Divider />
            </>
          )}
          <div className={css.info}>
            <Typography className={css.overline}>ADDING NEW OWNER &darr;</Typography>
          </div>
          <Divider />
          <Box padding={2}>
            <EthHashInfo address={newOwner.address} shortAddress={false} />
          </Box>
        </Grid>
      </Grid>
      <NonceForm
        onChange={setEditableNonce}
        recommendedNonce={safeGas?.recommendedNonce}
        safeNonce={safeGas?.currentNonce}
      />

      <SignOrExecuteForm safeTx={safeTx} onSubmit={addAddressBookEntryAndSubmit} isExecutable={safe?.threshold === 1} />

      {txError && (
        <ErrorMessage>
          This transaction will most likely fail. To save gas costs, avoid creating the transaction.
          <p>{txError.message}</p>
        </ErrorMessage>
      )}
    </div>
  )
}
