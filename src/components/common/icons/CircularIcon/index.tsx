import { Badge, SvgIcon, type BadgeProps } from '@mui/material'

import Box from '@mui/material/Box'
import css from './styles.module.css'

const CircularIcon = ({
  icon,
  size = 40,
  badgeColor,
}: {
  icon: any // Using SvgIconProps['component'] (any) directly causes type error
  badgeColor?: BadgeProps['color']
  size?: number
}) => {
  return (
    <Badge
      color={badgeColor}
      overlap="circular"
      variant="dot"
      invisible={!badgeColor}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      className={css.badge}
    >
      <Box className={css.circle} width={size} height={size}>
        <SvgIcon
          component={icon}
          inheritViewBox
          sx={{
            height: size / 2,
            width: size / 2,
            '& path': {
              fill: ({ palette }) => palette.primary.light,
            },
          }}
        />
      </Box>
    </Badge>
  )
}

export default CircularIcon
