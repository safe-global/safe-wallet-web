import { Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import FieldsGrid from '../FieldsGrid'

const SendToBlock = ({ address, title = 'To' }: { address: string; title?: string }) => {
  return (
    <FieldsGrid title={title}>
      <Typography variant="body2" component="div">
        <EthHashInfo address={address} shortAddress={false} hasExplorer showCopyButton />
      </Typography>
    </FieldsGrid>
  )
}

export default SendToBlock
