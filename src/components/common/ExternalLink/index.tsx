import type { ReactElement } from 'react'
import { OpenInNewRounded } from '@mui/icons-material'
import { Box, Button, Link, type LinkProps } from '@mui/material'

/**
 * Renders an external Link which always sets the noopener and noreferrer rel attribute and the target to _blank.
 * It also always adds the external link icon as end adornment.
 */
const ExternalLink = ({
  noIcon = false,
  children,
  href,
  variant = 'button',
  ...props
}: Omit<LinkProps, 'target' | 'rel' | 'variant'> & { noIcon?: boolean; variant?: 'button' | 'link' }): ReactElement => {
  if (!href) return <>{children}</>
  return variant === 'link' ? (
    <Link rel="noreferrer noopener" target="_blank" {...props}>
      <Box display="inline-flex" alignItems="center" gap={0.2} component="span">
        {children}
        {!noIcon && <OpenInNewRounded fontSize="small" />}
      </Box>
    </Link>
  ) : (
    <Button variant="outlined" href={href} rel="noreferrer noopener" target="_blank" sx={props.sx}>
      <Box display="inline-flex" alignItems="center" gap={0.2} component="span">
        {children}
        {!noIcon && <OpenInNewRounded fontSize="small" />}
      </Box>
    </Button>
  )
}

export default ExternalLink
