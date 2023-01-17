import { useState } from 'react'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import MUILink from '@mui/material/Link'
import Fab from '@mui/material/Fab'
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded'

import CodeIcon from '@/public/images/apps/code-icon.svg'
import css from './styles.module.css'

const SafeAppsSDKLink = () => {
  const [openModal, setOpenModal] = useState<boolean>(false)

  const safeAppsSDKUrl = 'https://github.com/safe-global/safe-apps-sdk'

  return (
    <Box className={css.position} onMouseEnter={() => setOpenModal(true)} onMouseLeave={() => setOpenModal(false)}>
      <Collapse in={openModal}>
        {
          <Box className={css.container}>
            <CodeIcon />

            <Typography variant="h6" className={css.title}>
              How to build on Safe?
            </Typography>

            <Link href={safeAppsSDKUrl} passHref>
              <MUILink rel="noreferrer noopener" target="_blank" href={safeAppsSDKUrl} className={css.link}>
                Learn more about Safe Apps SDK
              </MUILink>
            </Link>
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
