import { useContext, useEffect } from 'react'
import { Typography, Divider, Box, SvgIcon, Paper } from '@mui/material'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useSafeInfo from '@/hooks/useSafeInfo'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createSwapOwnerTx, createAddOwnerTx } from '@/services/tx/tx-sender'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { SafeTxContext } from '../../SafeTxProvider'
import type { AddOwnerFlowProps } from '.'
import type { ReplaceOwnerFlowProps } from '../ReplaceOwner'
import PlusIcon from '@/public/images/common/plus.svg'
import MinusIcon from '@/public/images/common/minus.svg'
import EthHashInfo from '@/components/common/EthHashInfo'
import commonCss from '@/components/tx-flow/common/styles.module.css'

export const ReviewOwner = ({ params }: { params: AddOwnerFlowProps | ReplaceOwnerFlowProps }) => {
  const dispatch = useAppDispatch()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const { safe } = useSafeInfo()
  const { chainId } = safe
  const { newOwner, removedOwner, threshold } = params

  useEffect(() => {
    const promise = removedOwner
      ? createSwapOwnerTx({
          newOwnerAddress: newOwner.address,
          oldOwnerAddress: removedOwner.address,
        })
      : createAddOwnerTx({
          ownerAddress: newOwner.address,
          threshold,
        })

    promise.then(setSafeTx).catch(setSafeTxError)
  }, [removedOwner, newOwner, threshold, setSafeTx, setSafeTxError])

  const addAddressBookEntryAndSubmit = () => {
    if (typeof newOwner.name !== 'undefined') {
      dispatch(
        upsertAddressBookEntry({
          chainId: chainId,
          address: newOwner.address,
          name: newOwner.name,
        }),
      )
    }

    trackEvent({ ...SETTINGS_EVENTS.SETUP.THRESHOLD, label: safe.threshold })
    trackEvent({ ...SETTINGS_EVENTS.SETUP.OWNERS, label: safe.owners.length })
  }

  return (
    <SignOrExecuteForm onSubmit={addAddressBookEntryAndSubmit}>
      {params.removedOwner && (
        <Paper sx={{ backgroundColor: ({ palette }) => palette.warning.background, p: 2 }}>
          <Typography color="text.secondary" mb={2} display="flex" alignItems="center">
            <SvgIcon component={MinusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
            Previous owner
          </Typography>
          <EthHashInfo
            name={params.removedOwner.name}
            address={params.removedOwner.address}
            shortAddress={false}
            showCopyButton
            hasExplorer
          />
        </Paper>
      )}
      <Paper sx={{ backgroundColor: ({ palette }) => palette.success.background, p: 2 }}>
        <Typography color="text.secondary" mb={2} display="flex" alignItems="center">
          <SvgIcon component={PlusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
          New owner
        </Typography>
        <EthHashInfo name={newOwner.name} address={newOwner.address} shortAddress={false} showCopyButton hasExplorer />
      </Paper>
      <Divider className={commonCss.nestedDivider} />
      <Box>
        <Typography variant="body2">Any transaction requires the confirmation of:</Typography>
        <Typography>
          <b>{threshold}</b> out of <b>{safe.owners.length + (removedOwner ? 0 : 1)} owners</b>
        </Typography>
      </Box>
      <Divider className={commonCss.nestedDivider} />
    </SignOrExecuteForm>
  )
}
