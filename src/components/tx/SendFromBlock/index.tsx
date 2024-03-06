import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeAddress from '@/hooks/useSafeAddress'
import SouthIcon from '@mui/icons-material/South'
import { Box, Typography } from '@mui/material'
import { type ReactElement } from 'react'
import css from './styles.module.css'

// TODO: Remove this file after replacing in all tx flow components
const SendFromBlock = ({ title }: { title?: string }): ReactElement => {
  const address = useSafeAddress()

  return (
    <Box data-sid="24857" className={css.container} pb={2} mb={2}>
      <Typography color="text.secondary" pb={1}>
        {title || 'Sending from'}
      </Typography>

      <Typography variant="body2" component="div">
        <EthHashInfo address={address} shortAddress={false} hasExplorer showCopyButton />
      </Typography>

      <SouthIcon className={css.arrow} />
    </Box>
  )
}

export default SendFromBlock
