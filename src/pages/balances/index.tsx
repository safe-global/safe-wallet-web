import type { NextPage } from 'next'
import Head from 'next/head'

import AssetsTable from '@/components/balances/AssetsTable'
import AssetsHeader from '@/components/balances/AssetsHeader'
import useBalances from '@/hooks/useBalances'

import PagePlaceholder from '@/components/common/PagePlaceholder'
import NoAssetsIcon from '@/public/images/balances/no-assets.svg'
import CurrencySelect from '@/components/balances/CurrencySelect'
import TokenListSelect from '@/components/balances/TokenListSelect'
import { useState } from 'react'
import SendButton from '@/components/balances/SendButton'

const Balances: NextPage = () => {
  const { error } = useBalances()
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Assets'}</title>
      </Head>

      <AssetsHeader>
        <TokenListSelect />
        <CurrencySelect />
        <SendButton tokenAddresses={selectedTokens} />
      </AssetsHeader>

      <main>
        {error ? (
          <PagePlaceholder img={<NoAssetsIcon />} text="There was an error loading your assets" />
        ) : (
          <AssetsTable selectedTokens={selectedTokens} setSelectedTokens={setSelectedTokens} />
        )}
      </main>
    </>
  )
}

export default Balances
