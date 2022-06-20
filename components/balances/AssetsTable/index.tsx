import { type ReactElement } from 'react'
import { SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import FiatValue from '@/components/common/FiatValue'
import TokenAmount, { TokenIcon } from '@/components/common/TokenAmount'
import EnhancedTable from '@/components/common/EnhancedTable'

interface AssetsTableProps {
  items?: SafeBalanceResponse['items']
}

const headCells = [
  {
    id: 'asset',
    label: 'Asset',
  },
  {
    id: 'balance',
    label: 'Balance',
    width: '20%',
  },
  {
    id: 'value',
    label: 'Value',
    width: '20%',
  },
  {
    id: 'actions',
    label: '',
    width: '20%',
  },
]

const AssetsTable = ({ items }: AssetsTableProps): ReactElement => {
  const rows = (items || []).map((item) => ({
    asset: {
      rawValue: item.tokenInfo.name,
      content: (
        <>
          <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />
          {item.tokenInfo.name}
        </>
      ),
    },
    balance: {
      rawValue: Number(item.balance) / 10 ** item.tokenInfo.decimals,
      content: <TokenAmount value={item.balance} decimals={item.tokenInfo.decimals} />,
    },
    value: {
      rawValue: parseFloat(item.fiatBalance),
      content: <FiatValue value={item.fiatBalance} />,
    },
    actions: {
      rawValue: '',
      content: '',
    },
  }))

  return <EnhancedTable rows={rows} headCells={headCells} />
}

export default AssetsTable
