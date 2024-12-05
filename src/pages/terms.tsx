import CustomLink from '@/components/common/CustomLink'
import type { NextPage } from 'next'
import Head from 'next/head'
import { IS_OFFICIAL_HOST } from '@/config/constants'
import SafeTerms from '@/markdown/terms/terms.md'
import type { MDXComponents } from 'mdx/types'

const overrideComponents: MDXComponents = {
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
