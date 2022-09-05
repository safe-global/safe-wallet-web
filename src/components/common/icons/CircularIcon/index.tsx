import { SvgIcon, Palette } from '@mui/material'

import Box from '@mui/material/Box'
import css from './styles.module.css'

const CircularIcon = ({
  component,
  size = 40,
  badgeColor,
}: {
  component: any // Using SvgIconProps['component'] (any) directly causes type error
  badgeColor?: keyof Palette
  size?: number
}) => {
  return (
    <Box className={css.circle} width={size} height={size}>
      <SvgIcon
        component={component}
        inheritViewBox
        sx={{
          height: size / 2,
          width: size / 2,
          '& path': {
            fill: ({ palette }) => palette.secondary.light,
          },
        }}
      />
      {/* @ts-expect-error TODO: Add type support */}
      {badgeColor && <Box className={css.icon} sx={{ backgroundColor: ({ palette }) => palette[badgeColor].main }} />}
    </Box>
  )
}

export default CircularIcon
