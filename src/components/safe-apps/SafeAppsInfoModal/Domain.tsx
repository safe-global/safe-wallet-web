import React from 'react'
import { Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

import styles from './styles.module.css'

type DomainProps = {
  url: string
  showInOneLine?: boolean
}

const Domain: React.FC<DomainProps> = ({ url, showInOneLine }): React.ReactElement => {
  return (
    <Typography className={styles.domainText} sx={showInOneLine ? { overflowY: 'hidden', whiteSpace: 'nowrap' } : {}}>
      <CheckIcon color="success" className={styles.domainIcon} /> {url}
    </Typography>
  )
}

export default Domain
