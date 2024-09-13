import { render } from '@/tests/test-utils'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { SettingsInfoType } from '@safe-global/safe-gateway-typescript-sdk'
import SettingsChange from './index'
import { ownerAddress, txInfo } from './utils'

describe('SettingsChange', () => {
  it('should display the SettingsChange component with owner details', () => {
    const { container, getByText } = render(<SettingsChange txDetails={{} as TransactionDetails} txInfo={txInfo} />)

    expect(container).toMatchSnapshot()
    expect(getByText('New signer')).toBeInTheDocument()
    expect(getByText(ownerAddress)).toBeInTheDocument()
  })

  it('should display the SettingsChange component with newOwner details', () => {
    const newOwnerAddress = '0x0000000000000000'

    const { container, getByText } = render(
      <SettingsChange
        txDetails={{} as TransactionDetails}
        txInfo={{
          ...txInfo,
          settingsInfo: {
            type: SettingsInfoType.SWAP_OWNER,
            oldOwner: {
              value: ownerAddress,
              name: 'Bob',
              logoUri: 'http://bob.com',
            },
            newOwner: {
              value: newOwnerAddress,
              name: 'Alice',
              logoUri: 'http://alice.com',
            },
          },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
    expect(getByText('Previous signer')).toBeInTheDocument()
    expect(getByText(newOwnerAddress)).toBeInTheDocument()
  })
})
