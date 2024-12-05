import CustomLink from '@/components/common/CustomLink'
import type { MDXComponents } from 'mdx/types'
import type { NextPage } from 'next'
import Head from 'next/head'
import { IS_OFFICIAL_HOST } from '@/config/constants'
import SafePrivacyPolicy from '@/markdown/privacy/privacy.md'

const overrideComponents: MDXComponents = {
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
