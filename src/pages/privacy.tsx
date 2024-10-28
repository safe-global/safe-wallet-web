import MUILink from '@mui/material/Link'
import type { LinkProps as MUILinkProps } from '@mui/material/Link/Link'
import type { MDXComponents } from 'mdx/types'
import type { LinkProps as NextLinkProps } from 'next/dist/client/link'
import NextLink from 'next/link'
import type { NextPage } from 'next'
import Head from 'next/head'
import { IS_OFFICIAL_HOST } from '@/config/constants'
import SafePrivacyPolicy from '@/markdown/privacy/privacy.md'

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

const PrivacyPolicy: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Privacy policy'}</title>
      </Head>

      <main>{IS_OFFICIAL_HOST && <SafePrivacyPolicy components={overrideComponents} />}</main>
    </>
  )
}

export default PrivacyPolicy
