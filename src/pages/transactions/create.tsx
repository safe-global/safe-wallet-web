import NewTxModal from '@/components/tx/modals/NewTxModal'
import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { notifyTransaction } from '@/api'
import { parsePrefixedAddress } from '@/utils/addresses'
import WalletConnectFence from '@/components/common/WalletConntectFence'

interface ICreateTxPageProps {
  amount?: string
  to?: string
  currency?: string
  chatId?: string
  type?: string
}

const CreateTxPage: React.FunctionComponent<ICreateTxPageProps> = ({ amount, to, currency, type, chatId }) => {
  const router = useRouter()
  const { safe } = router.query
  const { prefix } = parsePrefixedAddress(safe as string)

  useEffect(() => {
    const unsubPropose = txSubscribe(TxEvent.PROPOSED, async (detail) => {
      const txId = detail.txId
      console.log('TxEvent.PROPOSED', txId, prefix!, chatId!)

      await notifyTransaction(txId, prefix!, chatId!)
    })

    return () => {
      unsubPropose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Suspense>
      <WalletConnectFence>
        <NewTxModal
          recipient={to}
          amount={amount}
          currency={currency}
          type={type}
          onClose={() =>
            router.push({
              pathname: AppRoutes.transactions.queue,
              query: { safe: router.query.safe },
            })
          }
        />
      </WalletConnectFence>
    </Suspense>
  )
}

export async function getServerSideProps(context: any) {
  const { amount, to, currency, chatId, type } = context.query

  return {
    props: {
      amount: amount || '',
      to: to || '',
      currency: currency || '',
      chatId: chatId || '',
      type: type || '',
    },
  }
}

export default CreateTxPage
