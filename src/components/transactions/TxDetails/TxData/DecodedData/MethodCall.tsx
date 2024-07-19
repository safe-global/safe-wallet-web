import EthHashInfo from '@/components/common/EthHashInfo'
import { Box, Typography } from '@mui/material'

const MethodCall = ({
  method,
  contractAddress,
  contractName,
  contractLogo,
}: {
  method: string
  contractAddress: string
  contractName?: string
  contractLogo?: string
}) => {
  return (
    <>
      <Typography fontWeight="bold" display="flex" alignItems="center" gap=".5em" pb={1.5}>
        Call{' '}
        <Typography
          component="code"
          variant="body2"
          sx={{
            backgroundColor: 'background.main',
            px: 1,
            py: 0.5,
            borderRadius: 0.5,
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}
        >
          {method}
        </Typography>{' '}
        on
        <EthHashInfo
          address={contractAddress}
          name={contractName}
          customAvatar={contractLogo}
          onlyName
          hasExplorer
          showCopyButton
          avatarSize={26}
        />
      </Typography>

      {/* Divider */}
      <Box
        borderBottom="1px solid var(--color-border-light)"
        width="calc(100% + 32px)"
        sx={{ ml: '-16px !important' }}
      />
    </>
  )
}

export default MethodCall
