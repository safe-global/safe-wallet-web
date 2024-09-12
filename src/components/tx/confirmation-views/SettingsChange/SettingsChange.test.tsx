import { render } from '@/tests/test-utils'
import { SettingsInfoType, TransactionDetails, TransactionInfoType } from '@safe-global/safe-gateway-typescript-sdk'
import SettingsChange from './index'

const ownerAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const txInfo: TransactionDetails['txInfo'] = {
  type: TransactionInfoType.SETTINGS_CHANGE,
  humanDescription: 'Add new owner 0xd8dA...6045 with threshold 1',
  dataDecoded: {
    method: 'addOwnerWithThreshold',
    parameters: [
      {
        name: 'owner',
        type: 'address',
        value: ownerAddress,
      },
      {
        name: '_threshold',
        type: 'uint256',
        value: '1',
      },
    ],
  },
  settingsInfo: {
    type: SettingsInfoType.ADD_OWNER,
    owner: {
      value: ownerAddress,
      name: 'Nevinha',
      logoUri: 'http://something.com',
    },
    threshold: 1,
  },
}

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
