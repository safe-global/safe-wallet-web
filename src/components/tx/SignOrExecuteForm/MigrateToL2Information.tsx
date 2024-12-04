import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
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
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
            }}
          >
            Migration to compatible base contract
          </Typography>
        </AlertTitle>
        <Typography>
          {variant === 'history'
            ? 'This Safe was using an incompatible base contract. This transaction includes the migration to a supported base contract.'
            : 'This Safe is currently using an incompatible base contract. The transaction was automatically modified to first migrate to a supported base contract.'}
        </Typography>

        {newMasterCopy && (
          <Box
            sx={{
              mt: 2,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
              }}
            >
              New contract
            </Typography>
            <NamedAddressInfo address={newMasterCopy} shortAddress={false} showCopyButton hasExplorer />
          </Box>
        )}
      </Alert>
    </Box>
  )
}
