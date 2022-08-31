import { Badge, Avatar, SvgIcon, type BadgeProps } from '@mui/material'

import Keyhole from '@/components/common/ConnectWallet/keyhole.svg'

import css from '@/components/common/ConnectWallet/styles.module.css'

const KeyholeIcon = ({
  height = 40,
  width = 40,
  variant = 'dot',
}: {
  height?: number
  width?: number
  variant?: BadgeProps['variant']
}) => {
  return (
    <Badge
      overlap="circular"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      variant={variant}
      color="error"
      className={css.keyhole}
    >
      <Avatar
        alt="Not connected"
        sx={{
          bgcolor: ({ palette }) => palette.background.main,
          height,
          width,
        }}
      >
        <SvgIcon
          component={Keyhole}
          inheritViewBox
          sx={{
            height: height / 2,
            width: width / 2,
            '& path': {
              fill: ({ palette }) => palette.secondary.light,
            },
          }}
        />
      </Avatar>
    </Badge>
  )
}

export default KeyholeIcon
