import css from '@/components/common/icons/CircularIcon/styles.module.css'
import LockIcon from '@/public/images/common/lock.svg'
import Badge from '@mui/material/Badge'
import SvgIcon from '@mui/material/SvgIcon'

const KeyholeIcon = ({ size = 28 }: { size?: number }) => {
  return (
    <Badge
      color="error"
      overlap="circular"
      variant="dot"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      className={css.badge}
    >
      <SvgIcon
        color="border"
        component={LockIcon}
        inheritViewBox
        sx={{
          height: size,
          width: size,
        }}
      />
    </Badge>
  )
}

export default KeyholeIcon
