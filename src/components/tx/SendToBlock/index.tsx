import { Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import FieldsGrid from '../FieldsGrid'

const SendToBlock = ({
  address,
  title = 'To',
  avatarSize,
  name,
}: {
  address: string
  name?: string
  title?: string
  avatarSize?: number
}) => {
  return (
    <FieldsGrid title={title}>
      <Typography variant="body2" component="div">
        <EthHashInfo
          address={address}
          name={name}
          shortAddress={false}
          hasExplorer
          showCopyButton
          avatarSize={avatarSize}
        />
      </Typography>
    </FieldsGrid>
  )
}

export default SendToBlock
