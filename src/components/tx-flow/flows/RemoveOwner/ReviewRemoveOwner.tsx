import { useContext, useEffect } from 'react'
import { Typography, Divider, Box, Paper, SvgIcon } from '@mui/material'
import { EthHashInfo } from '@safe-global/safe-react-components'
import type { ReactElement } from 'react'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useAddressBook from '@/hooks/useAddressBook'
import useSafeInfo from '@/hooks/useSafeInfo'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createRemoveOwnerTx } from '@/services/tx/tx-sender'
import RectangleIcon from '@/public/images/settings/setup/rectangle.svg'
import { SafeTxContext } from '../../SafeTxProvider'
import type { RemoveOwnerFlowProps } from '.'

import commonCss from '@/components/tx-flow/common/styles.module.css'
import css from './styles.module.css'

export const ReviewRemoveOwner = ({ params }: { params: RemoveOwnerFlowProps }): ReactElement => {
  const addressBook = useAddressBook()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const { safe, safeAddress } = useSafeInfo()
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
      <div className={css.addresses}>
        <div>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Selected Safe Account
          </Typography>
          <Paper sx={{ backgroundColor: ({ palette }) => palette.background.main }} className={css.address}>
            <EthHashInfo
              address={safeAddress}
              name={addressBook[safeAddress]}
              shortAddress={false}
              showCopyButton
              hasExplorer
            />
          </Paper>
        </div>
        <div className={css.action}>
          <SvgIcon component={RectangleIcon} inheritViewBox fontSize="small" />
          Remove the owner
        </div>
        <div>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            Selected owner
          </Typography>
          <Paper sx={{ backgroundColor: ({ palette }) => palette.warning.background }} className={css.address}>
            <EthHashInfo
              address={removedOwner.address}
              name={addressBook[removedOwner.address]}
              shortAddress={false}
              showCopyButton
              hasExplorer
            />
          </Paper>
        </div>
      </div>
      <Divider className={commonCss.nestedDivider} />
      <Box m={1}>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Any transaction requires the confirmation of:
        </Typography>
        <Typography>
          <b>{threshold}</b> out of <b>{newOwnerLength}</b> owners
        </Typography>
      </Box>
      <Divider className={commonCss.nestedDivider} />
    </SignOrExecuteForm>
  )
}
