import { Methods } from '@safe-global/safe-apps-sdk'
import * as web3 from '../../../hooks/wallets/web3'
import { Web3Provider } from '@ethersproject/providers'
import { render, screen } from '@/tests/test-utils'
import SafeAppsSignMessageModal from './'
import { SafeAppAccessPolicyTypes } from '@safe-global/safe-gateway-typescript-sdk'

describe('SafeAppsSignMessageModal', () => {
  test('can handle messages with EIP712Domain type in the JSON-RPC payload', () => {
    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(() => new Web3Provider(jest.fn()))

    render(
      <SafeAppsSignMessageModal
        onClose={() => {}}
        initialData={[
          {
            app: {
              id: 73,
              url: 'https://app.com',
              name: 'App',
              iconUrl: 'https://app.com/icon.png',
              description: 'App description',
              chainIds: ['1'],
              tags: [],
              features: [],
              socialProfiles: [],
              developerWebsite: '',
              accessControl: {
                type: SafeAppAccessPolicyTypes.NoRestrictions,
              },
            },
            appId: 73,
            requestId: '73',
            message: {
              types: {
                Vote: [
                  {
                    name: 'from',
                    type: 'address',
                  },
                  {
                    name: 'space',
                    type: 'string',
                  },
                  {
                    name: 'timestamp',
                    type: 'uint64',
                  },
                  {
                    name: 'proposal',
                    type: 'bytes32',
                  },
                  {
                    name: 'choice',
                    type: 'uint32',
                  },
                ],
                EIP712Domain: [
                  { name: 'name', type: 'string' },
                  { name: 'version', type: 'string' },
                ],
              },
              domain: {
                name: 'snapshot',
                version: '0.1.4',
              },
              message: {
                from: '0x292bacf82268e143f5195af6928693699e31f911',
                space: 'fabien.eth',
                timestamp: '1663592967',
                proposal: '0xbe992f0a433d2dbe2e0cee579e5e1bdb625cdcb3a14357ea990c6cdc3e129991',
                choice: '1',
              },
            },
            method: Methods.signTypedMessage,
          },
        ]}
      />,
    )

    expect(screen.getByText('Interact with SignMessageLib')).toBeInTheDocument()
  })
})
