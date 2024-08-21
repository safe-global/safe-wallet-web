import { Alert, AlertTitle, Box, Paper, SvgIcon, Typography } from '@mui/material'
import InfoOutlinedIcon from '@/public/images/notifications/info.svg'
import EthHashInfo from '@/components/common/EthHashInfo'
import MinusIcon from '@/public/images/common/minus.svg'
import PlusIcon from '@/public/images/common/plus.svg'
import useSafeInfo from '@/hooks/useSafeInfo'

export const MigrateToL2Information = ({
  variant,
  newMasterCopy,
}: {
  variant: 'history' | 'queue'
  newMasterCopy?: string
}) => {
  const { safe } = useSafeInfo()
  return (
    <Box>
      <Alert severity="info" icon={<SvgIcon component={InfoOutlinedIcon} color="info" />}>
        <AlertTitle>
          <Typography variant="h5" fontWeight={700}>
            Migration to compatible base contract
          </Typography>
        </AlertTitle>
        {variant === 'history'
          ? 'This Safe was using an incompatible base contract. This transaction includes the migration to a supported base contract.'
          : 'This Safe is currently using an incompatible base contract. The transaction was automatically modified to first migrate to a supported base contract.'}
      </Alert>
      {variant === 'queue' && newMasterCopy !== undefined && (
        <>
          <Paper sx={{ backgroundColor: ({ palette }) => palette.warning.background, p: 2, mt: 2 }}>
            <Typography color="text.secondary" mb={2} display="flex" alignItems="center">
              <SvgIcon component={MinusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
              Previous base contract
            </Typography>
            <EthHashInfo
              name={safe.implementation.name}
              address={safe.implementation.value}
              shortAddress={false}
              showCopyButton
              hasExplorer
            />
          </Paper>
          <Paper sx={{ backgroundColor: ({ palette }) => palette.success.background, p: 2 }}>
            <Typography color="text.secondary" mb={2} display="flex" alignItems="center">
              <SvgIcon component={PlusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
              New base contract
            </Typography>
            <EthHashInfo address={newMasterCopy} shortAddress={false} showCopyButton hasExplorer />
          </Paper>
        </>
      )}
    </Box>
  )
}
