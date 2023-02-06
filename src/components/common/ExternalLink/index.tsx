import type { ReactElement } from 'react'
import { OpenInNewRounded } from '@mui/icons-material'
import { Box, Link, type LinkProps } from '@mui/material'

/**
 * Renders an external Link which always sets the noopener and noreferrer rel attribute and the target to _blank.
 * It also always adds the external link icon as end adornment.
 */
const ExternalLink = ({
  noIcon = false,
  children,
  ...props
}: Omit<LinkProps, 'target' | 'rel'> & { noIcon?: boolean }): ReactElement => {
  if (!props.href) return <>{children}</>

  return (
    <Link rel="noreferrer noopener" target="_blank" {...props}>
      <Box display="inline-flex" alignItems="center" gap={0.2} component="span">
        {children}
        {!noIcon && <OpenInNewRounded fontSize="small" />}
      </Box>
    </Link>
  )
}

export default ExternalLink
