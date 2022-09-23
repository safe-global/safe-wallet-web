import type { NextPage } from 'next'
import Head from 'next/head'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import TransactionsIcon from '@/public/images/sidebar/transactions.svg'
import useSafeInfo from '@/hooks/useSafeInfo'
import { AppRoutes } from '@/config/routes'
import SingleTx from '@/components/transactions/SingleTx'

const SingleTransaction: NextPage = () => {
  const { safeAddress } = useSafeInfo()

  const breadcrumbsLink = `${AppRoutes.transactions.index}?safe=${safeAddress}`

  return (
    <main>
      <Head>
        <title>Safe – Transaction details</title>
      </Head>

      <Breadcrumbs Icon={TransactionsIcon} first="Transactions" second="Details" firstLink={breadcrumbsLink} />

      <SingleTx />
    </main>
  )
}

export default SingleTransaction
