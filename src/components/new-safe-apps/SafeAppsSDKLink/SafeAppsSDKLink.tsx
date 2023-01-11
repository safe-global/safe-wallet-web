import { useState } from 'react'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Fab from '@mui/material/Fab'
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded'

import css from './styles.module.css'
import CodeIcon from '@/public/images/apps/code-icon.svg'

const SafeAppsSDKLink = () => {
  const [openModal, setOpenModal] = useState<boolean>(false)

  return (
    <Box className={css.position} onMouseEnter={() => setOpenModal(true)} onMouseLeave={() => setOpenModal(false)}>
      <Collapse in={openModal}>
        {
          <Box className={css.container}>
            <CodeIcon />
            <Typography variant="h6" className={css.title}>
              How to build on Safe?
            </Typography>

            <Link rel="noreferrer noopener" target="_blank" href="https://github.com/safe-global/safe-apps-sdk">
              Learn more about Safe Apps SDK
            </Link>
            <Typography> </Typography>
          </Box>
        }
      </Collapse>
      <Fab
        className={css.openButton}
        variant="extended"
        size="small"
        color="secondary"
        aria-label="add"
        onClick={() => setOpenModal(false)}
      >
        <KeyboardDoubleArrowUpRoundedIcon fontSize="small" />
      </Fab>
    </Box>
  )
}

export default SafeAppsSDKLink
