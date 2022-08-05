import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import React, { ReactElement } from 'react'
import { MultiSend } from '@gnosis.pm/safe-react-gateway-sdk'

export const MultiSendTxInfo = ({ txInfo }: { txInfo: MultiSend }): ReactElement => {
  return (
    <div>
      <InfoDetails title="MultiSend contract:">
        <EthHashInfo
          address={txInfo?.to.value || ''}
          name={txInfo?.to.name}
          customAvatar={txInfo?.to.logoUri}
          shortAddress={false}
          showCopyButton
          hasExplorer
        />
      </InfoDetails>
      <TxDataRow title="Value:">{txInfo?.value}</TxDataRow>
    </div>
  )
}
