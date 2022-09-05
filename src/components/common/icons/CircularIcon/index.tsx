import { useTheme } from '@mui/system'
import { Badge, Avatar, SvgIcon, type BadgeProps } from '@mui/material'

import css from '@/components/common/ConnectWallet/styles.module.css'

const CircularIcon = ({
  component,
  variant = 'dot',
  alt,
  height = 40,
  width = 40,
  color,
}: {
  component: any // Using SvgIconProps['component'] (any) directly causes type error
  color: NonNullable<BadgeProps['color']>
  variant?: BadgeProps['variant']
  alt: string
  height?: number
  width?: number
}) => {
  const { palette } = useTheme()
  return (
    <Badge
      overlap="circular"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      variant={variant}
      color={color}
      className={css.icon}
      sx={{
        '& .MuiBadge-badge': {
          border: `3px solid ${palette[color].main}`,
        },
      }}
    >
      <Avatar
        alt={alt}
        sx={{
          bgcolor: ({ palette }) => palette.background.main,
          height,
          width,
        }}
      >
        <SvgIcon
          component={component}
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

export default CircularIcon
