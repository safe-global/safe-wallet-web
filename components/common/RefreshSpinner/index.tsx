import { ReactElement } from 'react'
import RefreshIcon from '@mui/icons-material/Refresh'
import css from './styles.module.css'

const RefreshSpinner = (): ReactElement => <RefreshIcon className={css.spinner} />

export default RefreshSpinner
