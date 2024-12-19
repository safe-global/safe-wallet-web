import MUILink from '@mui/material/Link'
import type { LinkProps as MUILinkProps } from '@mui/material/Link/Link'
import type { LinkProps as NextLinkProps } from 'next/dist/client/link'
import NextLink from 'next/link'

const CustomLink: React.FC<
  React.PropsWithChildren<Omit<MUILinkProps, 'href'> & Pick<NextLinkProps, 'href' | 'as'>>
> = ({ href = '', as, children, ...other }) => {
  const isExternal = href.toString().startsWith('http')
  return (
    <NextLink href={href} as={as} passHref legacyBehavior>
      <MUILink target={isExternal ? '_blank' : ''} rel="noreferrer" {...other}>
        {children}
      </MUILink>
    </NextLink>
  )
}

export default CustomLink
