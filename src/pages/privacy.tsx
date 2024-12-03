import CustomLink from '@/components/common/CustomLink'
import type { MDXComponents } from 'mdx/types'
import type { NextPage } from 'next'
import Head from 'next/head'
import SafePrivacyPolicy from '@/markdown/privacy/privacy.md'
import { useIsOfficialHost } from '@/hooks/useIsOfficialHost'

const overrideComponents: MDXComponents = {
  a: CustomLink,
}

const PrivacyPolicy: NextPage = () => {
  const isOfficialHost = useIsOfficialHost()

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Privacy policy'}</title>
      </Head>

      <main>{isOfficialHost && <SafePrivacyPolicy components={overrideComponents} />}</main>
    </>
  )
}

export default PrivacyPolicy
