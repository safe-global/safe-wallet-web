import { type ElementType } from 'react'
import { Box, ButtonBase, SvgIcon, type SvgIconOwnProps, Typography } from '@mui/material'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import css from './styles.module.css'

const ChoiceButton = ({
  title,
  description,
  icon,
  iconColor,
  onClick,
  disabled,
  chip,
}: {
  title: string
  description?: string
  icon: ElementType
  iconColor?: SvgIconOwnProps['color']
  onClick: () => void
  disabled?: boolean
  chip?: string
}) => {
  return (
    <ButtonBase data-testid="choice-btn" className={css.txButton} onClick={onClick} disabled={disabled}>
      <Box
        className={css.iconBg}
        sx={{ backgroundColor: iconColor ? `var(--color-${iconColor}-background) !important` : '' }}
      >
        <SvgIcon component={icon} fontSize="small" inheritViewBox color={iconColor} />
      </Box>

      <Box py={0.2}>
        <Typography fontWeight="bold">{title}</Typography>

        {description && (
          <Typography variant="body2" color="primary.light">
            {description}
          </Typography>
        )}
      </Box>

      <SvgIcon component={ChevronRightRoundedIcon} color="border" sx={{ ml: 'auto' }} />

      {chip && <Box className={css.chip}>{chip}</Box>}
    </ButtonBase>
  )
}

export default ChoiceButton
