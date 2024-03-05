import { useContext, useEffect } from 'react'
import { Typography, Divider, Box, Paper, SvgIcon } from '@mui/material'
import type { ReactElement } from 'react'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useAddressBook from '@/hooks/useAddressBook'
import useSafeInfo from '@/hooks/useSafeInfo'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createRemoveOwnerTx } from '@/services/tx/tx-sender'
import MinusIcon from '@/public/images/common/minus.svg'
import { SafeTxContext } from '../../SafeTxProvider'
import type { RemoveOwnerFlowProps } from '.'
import EthHashInfo from '@/components/common/EthHashInfo'

import commonCss from '@/components/tx-flow/common/styles.module.css'

export const ReviewRemoveOwner = ({ params }: { params: RemoveOwnerFlowProps }): ReactElement => {
  const addressBook = useAddressBook()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const { safe } = useSafeInfo()
  const { removedOwner, threshold } = params

  useEffect(() => {
    createRemoveOwnerTx({ ownerAddress: removedOwner.address, threshold }).then(setSafeTx).catch(setSafeTxError)
  }, [removedOwner.address, setSafeTx, setSafeTxError, threshold])

  const newOwnerLength = safe.owners.length - 1

  const onFormSubmit = () => {
    trackEvent({ ...SETTINGS_EVENTS.SETUP.THRESHOLD, label: safe.threshold })
    trackEvent({ ...SETTINGS_EVENTS.SETUP.OWNERS, label: safe.owners.length })
  }

  return (
    <SignOrExecuteForm onSubmit={onFormSubmit}>
      <Paper sx={{ backgroundColor: ({ palette }) => palette.warning.background, p: 2 }}>
        <Typography color="text.secondary" mb={2} display="flex" alignItems="center">
          <SvgIcon component={MinusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
          Selected signer
        </Typography>
        <EthHashInfo
          address={removedOwner.address}
          name={addressBook[removedOwner.address]}
          shortAddress={false}
          showCopyButton
          hasExplorer
        />
      </Paper>
      <Divider className={commonCss.nestedDivider} />
      <Box m={1}>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Any transaction requires the confirmation of:
        </Typography>
        <Typography>
          <b>{threshold}</b> out of <b>{newOwnerLength}</b> signers
        </Typography>
      </Box>
      <Divider className={commonCss.nestedDivider} />
    </SignOrExecuteForm>
  )
}
