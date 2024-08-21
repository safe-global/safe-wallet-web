import { Alert, AlertTitle, Box, SvgIcon, Typography } from '@mui/material'
import InfoOutlinedIcon from '@/public/images/notifications/info.svg'
import NamedAddressInfo from '@/components/common/NamedAddressInfo'

export const MigrateToL2Information = ({
  variant,
  newMasterCopy,
}: {
  variant: 'history' | 'queue'
  newMasterCopy?: string
}) => {
  return (
    <Box>
      <Alert severity="info" icon={<SvgIcon component={InfoOutlinedIcon} color="info" />}>
        <AlertTitle>
          <Typography variant="h5" fontWeight={700}>
            Migration to compatible base contract
          </Typography>
        </AlertTitle>
        <Typography>
          {variant === 'history'
            ? 'This Safe was using an incompatible base contract. This transaction includes the migration to a supported base contract.'
            : 'This Safe is currently using an incompatible base contract. The transaction was automatically modified to first migrate to a supported base contract.'}
        </Typography>

        {newMasterCopy && (
          <Box mt={2}>
            <Typography variant="overline" color="text.secondary" fontWeight={700}>
              New contract
            </Typography>
            <NamedAddressInfo address={newMasterCopy} shortAddress={false} showCopyButton hasExplorer />
          </Box>
        )}
      </Alert>
    </Box>
  )
}
