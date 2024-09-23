import type { NextPage } from 'next'
import Head from 'next/head'
import { IS_OFFICIAL_HOST } from '@/config/constants'
import SafeTerms from '@/markdown/terms/terms.md'
import type { LinkProps as NextLinkProps } from 'next/link'
import NextLink from 'next/link'
import type { LinkProps as MUILinkProps } from '@mui/material/Link'
import MUILink from '@mui/material/Link'
import type { MDXComponents } from 'mdx/types'

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

const overrideComponents: MDXComponents = {
  // @ts-expect-error
  a: CustomLink,
}

const Terms: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Terms'}</title>
      </Head>

      <main>{IS_OFFICIAL_HOST && <SafeTerms components={overrideComponents} />}</main>
    </>
  )
}

export default Terms
