import { Box } from '@mui/material'
import css from './styles.module.css'
import classnames from 'classnames'
import { SafeCreationStatus } from '@/components/new-safe/steps/Step4/useSafeCreation'

const LoadingSpinner = ({ status }: { status: SafeCreationStatus }) => {
  const isError =
    status === SafeCreationStatus.ERROR ||
    status === SafeCreationStatus.REVERTED ||
    status === SafeCreationStatus.TIMEOUT ||
    status === SafeCreationStatus.WALLET_REJECTED

  return (
    <Box className={classnames(css.box, { [css.rectError]: isError })}>
      <div className={classnames(css.rect, css.rectTl)} />
      <div className={classnames(css.rect, css.rectTr)} />
      <div className={classnames(css.rect, css.rectBl)} />
      <div className={classnames(css.rect, css.rectBr)} />

      <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </Box>
  )
}

export default LoadingSpinner
