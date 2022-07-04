import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Divider, Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import { ChangeOwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { createTx } from '@/services/tx/txSender'
import useAsync from '@/hooks/useAsync'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { useAppDispatch } from '@/store'
import useSafeTxGas from '@/hooks/useSafeTxGas'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useChainId from '@/hooks/useChainId'
import { sameAddress } from '@/utils/addresses'
import useAddressBook from '@/hooks/useAddressBook'

export const ReviewOwnerTxStep = ({ data, onSubmit }: { data: ChangeOwnerData; onSubmit: (data: null) => void }) => {
  const { safe } = useSafeInfo()
  const chainId = useChainId()
  const dispatch = useAppDispatch()
  const safeSDK = useSafeSDK()
  const addressBook = useAddressBook()
  const { newOwner, removedOwner, threshold } = data

  // @TODO: move to txSender, add event dispatching
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

  const { safeGas, safeGasError } = useSafeTxGas(changeOwnerTx?.data)
  const { recommendedNonce = 0 } = safeGas || {}

  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    if (!changeOwnerTx || !recommendedNonce) return

    return await createTx({
      ...changeOwnerTx.data,
      nonce: recommendedNonce,
      safeTxGas: safeGas ? Number(safeGas.safeTxGas) : undefined,
    })
  }, [recommendedNonce, changeOwnerTx, safeGas?.safeTxGas])

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
    <SignOrExecuteForm
      safeTx={safeTx}
      onSubmit={addAddressBookEntryAndSubmit}
      isExecutable={safe?.threshold === 1}
      error={txError}
      title="Add new owner"
    >
      <Grid container spacing={2} py={3}>
        <Grid direction="column" xs item className={`${css.detailsBlock}`}>
          <Typography>Details</Typography>

          <Box marginBottom={2}>
            <Typography>Safe name:</Typography>
            <Typography>{safe ? addressBook[safe?.address.value] || 'No name' : ''}</Typography>
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
    </SignOrExecuteForm>
  )
}
