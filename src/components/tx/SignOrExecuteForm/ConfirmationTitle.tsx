import { Stack, SvgIcon, Typography } from '@mui/material'
import EditIcon from '@/public/images/common/edit.svg'
import classnames from 'classnames'
import css from './styles.module.css'

export enum ConfirmationTitleTypes {
  sign = 'confirm',
  execute = 'execute',
}

const ConfirmationTitle = ({ isCreation, variant }: { isCreation?: boolean; variant: ConfirmationTitleTypes }) => {
  return (
    <div className={css.wrapper}>
      <div
        className={classnames(css.icon, {
          [css.sign]: variant === ConfirmationTitleTypes.sign,
          [css.execute]: variant === ConfirmationTitleTypes.execute,
        })}
      >
        <SvgIcon component={EditIcon} inheritViewBox fontSize="small" color="primary" />
      </div>
      <Stack direction="column">
        <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
          {variant}
        </Typography>
        <Typography variant="body2">
          You&apos;re about to {isCreation ? 'create and ' : ''}
          {variant} this transaction.
        </Typography>
      </Stack>
    </div>
  )
}

export default ConfirmationTitle
