import { useEffect, useState } from 'react'
import { Fab, Typography } from '@mui/material'
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded'
import classnames from 'classnames'
import CodeIcon from '@/public/images/apps/code-icon.svg'
import { SAFE_APPS_SDK_DOCS_URL } from '@/config/constants'
import css from './styles.module.css'
import ExternalLink from '@/components/common/ExternalLink'

const SafeAppsSDKLink = () => {
  const [isMini, setMini] = useState(false)

  useEffect(() => {
    const minScroll = 130
    const onScroll = () => {
      const isScrolled = document.documentElement.scrollTop > minScroll
      setMini(isScrolled)
    }

    document.addEventListener('scroll', onScroll)

    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={classnames(css.container, { [css.mini]: isMini })}>
      <CodeIcon />

      <Typography variant="h6" className={css.title}>
        How to build on Safe?
      </Typography>

      <ExternalLink href={SAFE_APPS_SDK_DOCS_URL} className={css.link} noIcon variant="body2">
        <span>Learn more about Safe Apps SDK</span>
      </ExternalLink>

      <Fab className={css.openButton} variant="extended" size="small" color="secondary">
        <KeyboardDoubleArrowUpRoundedIcon fontSize="small" />
      </Fab>
    </div>
  )
}

export default SafeAppsSDKLink
