import { Paper, Typography, Box, Divider, SvgIcon } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import type { NarrowConfirmationViewProps } from '../types'
import { OwnerList } from '@/components/tx-flow/common/OwnerList'
import MinusIcon from '@/public/images/common/minus.svg'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import useSafeInfo from '@/hooks/useSafeInfo'
import type { SettingsChange } from '@safe-global/safe-gateway-typescript-sdk'

export interface SettingsChangeProps extends NarrowConfirmationViewProps {
  txInfo: SettingsChange
}

const SettingsChange: React.FC<SettingsChangeProps> = ({ txInfo }) => {
  const { safe } = useSafeInfo()
  const params = txInfo.settingsInfo

  if (!params) return null

  return (
    <>
      {'oldOwner' in params && (
        <Paper sx={{ backgroundColor: ({ palette }) => palette.warning.background, p: 2 }}>
          <Typography color="text.secondary" mb={2} display="flex" alignItems="center">
            <SvgIcon component={MinusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
            Previous signer
          </Typography>
          <EthHashInfo
            name={params.oldOwner.name}
            address={params.oldOwner.value}
            shortAddress={false}
            showCopyButton
            hasExplorer
          />
        </Paper>
      )}

      {'owner' in params && <OwnerList owners={[params.owner]} />}

      {'newOwner' in params && <OwnerList owners={[params.newOwner]} />}

      {'threshold' in params && (
        <>
          <Divider className={commonCss.nestedDivider} />

          <Box>
            <Typography variant="body2">Any transaction requires the confirmation of:</Typography>
            <Typography>
              <b>{params.threshold}</b> out of <b>{safe.owners.length + ('oldOwner' in params ? 0 : 1)} signers</b>
            </Typography>
          </Box>
        </>
      )}
      <Divider className={commonCss.nestedDivider} />
    </>
  )
}

export default SettingsChange
