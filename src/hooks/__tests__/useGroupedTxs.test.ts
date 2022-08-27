import { TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'

import * as txFilter from '@/utils/tx-history-filter'
import useGroupedTxs, { GroupedTxs, _addDateLabels, _groupTxItems } from '@/hooks/useGroupedTxs'
import { renderHook } from '@/tests/test-utils'

const txQueue = [
  { type: 'LABEL', label: 'Next' },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'multisig_0x1C786Ed20a0046A75D406348b37AC351Fd21fA8f_0x414605ca1a48b65dad5ebf94b2e92470a1d71c4d3879f1703ae60bbccc8aaf84',
      timestamp: 1661603497930,
      txStatus: 'AWAITING_CONFIRMATIONS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x1C786Ed20a0046A75D406348b37AC351Fd21fA8f' },
        recipient: { value: '0x1C786Ed20a0046A75D406348b37AC351Fd21fA8f' },
        direction: 'OUTGOING',
        transferInfo: { type: 'NATIVE_COIN', value: '100000000000000' },
      },
      executionInfo: {
        type: 'MULTISIG',
        nonce: 163,
        confirmationsRequired: 3,
        confirmationsSubmitted: 1,
        missingSigners: [
          { value: '0x01eA2703F7e680520dC71165b0A1ae7b79691198' },
          { value: '0xb85c789b5100f6DBDD6DD644a974Cb0c9971063B' },
          { value: '0xbbeedB6d8e56e23f5812e59d1b6602F15957271F' },
        ],
      },
    },
    conflictType: 'None',
  },
  { type: 'LABEL', label: 'Queued' },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'multisig_0x1C786Ed20a0046A75D406348b37AC351Fd21fA8f_0x2be1e6770f0f14907e22a8911d357f81e279dfe61b4a3ad32c6f3757d3ec25a8',
      timestamp: 1661603512101,
      txStatus: 'AWAITING_CONFIRMATIONS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x1C786Ed20a0046A75D406348b37AC351Fd21fA8f' },
        recipient: { value: '0x1C786Ed20a0046A75D406348b37AC351Fd21fA8f' },
        direction: 'OUTGOING',
        transferInfo: { type: 'NATIVE_COIN', value: '100000000000000' },
      },
      executionInfo: {
        type: 'MULTISIG',
        nonce: 164,
        confirmationsRequired: 3,
        confirmationsSubmitted: 1,
        missingSigners: [
          { value: '0x01eA2703F7e680520dC71165b0A1ae7b79691198' },
          { value: '0xb85c789b5100f6DBDD6DD644a974Cb0c9971063B' },
          { value: '0xbbeedB6d8e56e23f5812e59d1b6602F15957271F' },
        ],
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'multisig_0x1C786Ed20a0046A75D406348b37AC351Fd21fA8f_0x2b21af2f57376530a04ab95f833b6170a1f39a745b2b2b47319e7d9d04e3c674',
      timestamp: 1661603526075,
      txStatus: 'AWAITING_CONFIRMATIONS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x1C786Ed20a0046A75D406348b37AC351Fd21fA8f' },
        recipient: { value: '0x1C786Ed20a0046A75D406348b37AC351Fd21fA8f' },
        direction: 'OUTGOING',
        transferInfo: { type: 'NATIVE_COIN', value: '100000000000000000' },
      },
      executionInfo: {
        type: 'MULTISIG',
        nonce: 165,
        confirmationsRequired: 3,
        confirmationsSubmitted: 1,
        missingSigners: [
          { value: '0x01eA2703F7e680520dC71165b0A1ae7b79691198' },
          { value: '0xb85c789b5100f6DBDD6DD644a974Cb0c9971063B' },
          { value: '0xbbeedB6d8e56e23f5812e59d1b6602F15957271F' },
        ],
      },
    },
    conflictType: 'None',
  },
] as TransactionListItem[]

const conflictingTxQueue = [
  { type: 'LABEL', label: 'Next' },
  { type: 'CONFLICT_HEADER', nonce: 1571 },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'multisig_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0xcb4bf879443933f973ffa74a77e1e32894ff626fa151b3800e37b6150d0570dc',
      timestamp: 1661415466626,
      txStatus: 'AWAITING_CONFIRMATIONS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'OUTGOING',
        transferInfo: { type: 'NATIVE_COIN', value: '100000000000000' },
      },
      executionInfo: {
        type: 'MULTISIG',
        nonce: 1571,
        confirmationsRequired: 2,
        confirmationsSubmitted: 1,
        missingSigners: [
          { value: '0xFD71c1ABadBD37F60E4C8F208386dDFC4d2Bf01f' },
          { value: '0xD8572e60d13A7ec9AE2E9929A73f69E44049C975' },
          { value: '0x61BDdFA8600acfaE37eEf6D7Be0Dd85745389906' },
          { value: '0x69904ff6d6100799344E5C9A2806936318F6ba4f' },
          { value: '0x6484a2514AEE516DdaC6f67Dd2322f23e0A4A7D6' },
          { value: '0x8c35B7eE520277D14af5F6098835A584C337311b' },
          { value: '0x6E45d69a383CECa3d54688e833Bd0e1388747e6B' },
          { value: '0x11B1D54B66e5e226D6f89069c21A569A22D98cfd' },
          { value: '0xDe75665F3BE46D696e5579628fA17b662e6fC04e' },
          { value: '0x6f965E48347AF3Df65c14CCc176A9CbeCEa0eDb5' },
          { value: '0x730F87dA2A3C6721e2196DFB990759e9bdfc5083' },
          { value: '0x61a0c717d18232711bC788F19C9Cd56a43cc8872' },
          { value: '0x7724b234c9099C205F03b458944942bcEBA13408' },
        ],
      },
    },
    conflictType: 'HasNext',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'multisig_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x4e5ae21079f0203d006a1d0dcb715d02a284aacc2ffc169825f700ddaa8e0f78',
      timestamp: 1661600355129,
      txStatus: 'AWAITING_CONFIRMATIONS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'OUTGOING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99',
          tokenName: 'Basic Attention Token',
          tokenSymbol: 'BAT',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99.png',
          decimals: 18,
          value: '100000000000',
        },
      },
      executionInfo: {
        type: 'MULTISIG',
        nonce: 1571,
        confirmationsRequired: 2,
        confirmationsSubmitted: 1,
        missingSigners: [
          { value: '0xFD71c1ABadBD37F60E4C8F208386dDFC4d2Bf01f' },
          { value: '0xD8572e60d13A7ec9AE2E9929A73f69E44049C975' },
          { value: '0x61BDdFA8600acfaE37eEf6D7Be0Dd85745389906' },
          { value: '0x69904ff6d6100799344E5C9A2806936318F6ba4f' },
          { value: '0x6484a2514AEE516DdaC6f67Dd2322f23e0A4A7D6' },
          { value: '0x8c35B7eE520277D14af5F6098835A584C337311b' },
          { value: '0x6E45d69a383CECa3d54688e833Bd0e1388747e6B' },
          { value: '0x11B1D54B66e5e226D6f89069c21A569A22D98cfd' },
          { value: '0xDe75665F3BE46D696e5579628fA17b662e6fC04e' },
          { value: '0x6f965E48347AF3Df65c14CCc176A9CbeCEa0eDb5' },
          { value: '0x730F87dA2A3C6721e2196DFB990759e9bdfc5083' },
          { value: '0x61a0c717d18232711bC788F19C9Cd56a43cc8872' },
          { value: '0x7724b234c9099C205F03b458944942bcEBA13408' },
        ],
      },
    },
    conflictType: 'End',
  },
  { type: 'LABEL', label: 'Queued' },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'multisig_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x8b3d51aa4f500b77cbff8c9e1dd1d31bff1516fc1b0e7b92aa589b99f1a63d3d',
      timestamp: 1661488651712,
      txStatus: 'AWAITING_CONFIRMATIONS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        recipient: { value: '0xFfDC1BcdeC18b1196e7FA04246295DE3A17972Ac' },
        direction: 'OUTGOING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
      executionInfo: {
        type: 'MULTISIG',
        nonce: 1572,
        confirmationsRequired: 2,
        confirmationsSubmitted: 1,
        missingSigners: [
          { value: '0x3326c5D84bd462Ec1CadA0B5bBa9b2B85059FCba' },
          { value: '0xD8572e60d13A7ec9AE2E9929A73f69E44049C975' },
          { value: '0x61BDdFA8600acfaE37eEf6D7Be0Dd85745389906' },
          { value: '0x69904ff6d6100799344E5C9A2806936318F6ba4f' },
          { value: '0x6484a2514AEE516DdaC6f67Dd2322f23e0A4A7D6' },
          { value: '0x8c35B7eE520277D14af5F6098835A584C337311b' },
          { value: '0x6E45d69a383CECa3d54688e833Bd0e1388747e6B' },
          { value: '0x11B1D54B66e5e226D6f89069c21A569A22D98cfd' },
          { value: '0xDe75665F3BE46D696e5579628fA17b662e6fC04e' },
          { value: '0x6f965E48347AF3Df65c14CCc176A9CbeCEa0eDb5' },
          { value: '0x730F87dA2A3C6721e2196DFB990759e9bdfc5083' },
          { value: '0x61a0c717d18232711bC788F19C9Cd56a43cc8872' },
          { value: '0x7724b234c9099C205F03b458944942bcEBA13408' },
        ],
      },
    },
    conflictType: 'None',
  },
] as TransactionListItem[]

const groupedConflictingTxQueue = [
  {
    type: 'LABEL',
    label: 'Next',
  },
  [
    {
      type: 'TRANSACTION',
      transaction: {
        id: 'multisig_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0xcb4bf879443933f973ffa74a77e1e32894ff626fa151b3800e37b6150d0570dc',
        timestamp: 1661415466626,
        txStatus: 'AWAITING_CONFIRMATIONS',
        txInfo: {
          type: 'Transfer',
          sender: {
            value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
          },
          recipient: {
            value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
          },
          direction: 'OUTGOING',
          transferInfo: {
            type: 'NATIVE_COIN',
            value: '100000000000000',
          },
        },
        executionInfo: {
          type: 'MULTISIG',
          nonce: 1571,
          confirmationsRequired: 2,
          confirmationsSubmitted: 1,
          missingSigners: [
            {
              value: '0xFD71c1ABadBD37F60E4C8F208386dDFC4d2Bf01f',
            },
            {
              value: '0xD8572e60d13A7ec9AE2E9929A73f69E44049C975',
            },
            {
              value: '0x61BDdFA8600acfaE37eEf6D7Be0Dd85745389906',
            },
            {
              value: '0x69904ff6d6100799344E5C9A2806936318F6ba4f',
            },
            {
              value: '0x6484a2514AEE516DdaC6f67Dd2322f23e0A4A7D6',
            },
            {
              value: '0x8c35B7eE520277D14af5F6098835A584C337311b',
            },
            {
              value: '0x6E45d69a383CECa3d54688e833Bd0e1388747e6B',
            },
            {
              value: '0x11B1D54B66e5e226D6f89069c21A569A22D98cfd',
            },
            {
              value: '0xDe75665F3BE46D696e5579628fA17b662e6fC04e',
            },
            {
              value: '0x6f965E48347AF3Df65c14CCc176A9CbeCEa0eDb5',
            },
            {
              value: '0x730F87dA2A3C6721e2196DFB990759e9bdfc5083',
            },
            {
              value: '0x61a0c717d18232711bC788F19C9Cd56a43cc8872',
            },
            {
              value: '0x7724b234c9099C205F03b458944942bcEBA13408',
            },
          ],
        },
      },
      conflictType: 'HasNext',
    },
    {
      type: 'TRANSACTION',
      transaction: {
        id: 'multisig_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x4e5ae21079f0203d006a1d0dcb715d02a284aacc2ffc169825f700ddaa8e0f78',
        timestamp: 1661600355129,
        txStatus: 'AWAITING_CONFIRMATIONS',
        txInfo: {
          type: 'Transfer',
          sender: {
            value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
          },
          recipient: {
            value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
          },
          direction: 'OUTGOING',
          transferInfo: {
            type: 'ERC20',
            tokenAddress: '0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99',
            tokenName: 'Basic Attention Token',
            tokenSymbol: 'BAT',
            logoUri:
              'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99.png',
            decimals: 18,
            value: '100000000000',
          },
        },
        executionInfo: {
          type: 'MULTISIG',
          nonce: 1571,
          confirmationsRequired: 2,
          confirmationsSubmitted: 1,
          missingSigners: [
            {
              value: '0xFD71c1ABadBD37F60E4C8F208386dDFC4d2Bf01f',
            },
            {
              value: '0xD8572e60d13A7ec9AE2E9929A73f69E44049C975',
            },
            {
              value: '0x61BDdFA8600acfaE37eEf6D7Be0Dd85745389906',
            },
            {
              value: '0x69904ff6d6100799344E5C9A2806936318F6ba4f',
            },
            {
              value: '0x6484a2514AEE516DdaC6f67Dd2322f23e0A4A7D6',
            },
            {
              value: '0x8c35B7eE520277D14af5F6098835A584C337311b',
            },
            {
              value: '0x6E45d69a383CECa3d54688e833Bd0e1388747e6B',
            },
            {
              value: '0x11B1D54B66e5e226D6f89069c21A569A22D98cfd',
            },
            {
              value: '0xDe75665F3BE46D696e5579628fA17b662e6fC04e',
            },
            {
              value: '0x6f965E48347AF3Df65c14CCc176A9CbeCEa0eDb5',
            },
            {
              value: '0x730F87dA2A3C6721e2196DFB990759e9bdfc5083',
            },
            {
              value: '0x61a0c717d18232711bC788F19C9Cd56a43cc8872',
            },
            {
              value: '0x7724b234c9099C205F03b458944942bcEBA13408',
            },
          ],
        },
      },
      conflictType: 'End',
    },
  ],
  {
    type: 'LABEL',
    label: 'Queued',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'multisig_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x8b3d51aa4f500b77cbff8c9e1dd1d31bff1516fc1b0e7b92aa589b99f1a63d3d',
      timestamp: 1661488651712,
      txStatus: 'AWAITING_CONFIRMATIONS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        recipient: {
          value: '0xFfDC1BcdeC18b1196e7FA04246295DE3A17972Ac',
        },
        direction: 'OUTGOING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
      executionInfo: {
        type: 'MULTISIG',
        nonce: 1572,
        confirmationsRequired: 2,
        confirmationsSubmitted: 1,
        missingSigners: [
          {
            value: '0x3326c5D84bd462Ec1CadA0B5bBa9b2B85059FCba',
          },
          {
            value: '0xD8572e60d13A7ec9AE2E9929A73f69E44049C975',
          },
          {
            value: '0x61BDdFA8600acfaE37eEf6D7Be0Dd85745389906',
          },
          {
            value: '0x69904ff6d6100799344E5C9A2806936318F6ba4f',
          },
          {
            value: '0x6484a2514AEE516DdaC6f67Dd2322f23e0A4A7D6',
          },
          {
            value: '0x8c35B7eE520277D14af5F6098835A584C337311b',
          },
          {
            value: '0x6E45d69a383CECa3d54688e833Bd0e1388747e6B',
          },
          {
            value: '0x11B1D54B66e5e226D6f89069c21A569A22D98cfd',
          },
          {
            value: '0xDe75665F3BE46D696e5579628fA17b662e6fC04e',
          },
          {
            value: '0x6f965E48347AF3Df65c14CCc176A9CbeCEa0eDb5',
          },
          {
            value: '0x730F87dA2A3C6721e2196DFB990759e9bdfc5083',
          },
          {
            value: '0x61a0c717d18232711bC788F19C9Cd56a43cc8872',
          },
          {
            value: '0x7724b234c9099C205F03b458944942bcEBA13408',
          },
        ],
      },
    },
    conflictType: 'None',
  },
] as GroupedTxs

const txHistoryIncoming = [
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x7985e2b4148583353d05098768a07c8f2d232325689f2dca83242bf5bf36d309_0xe15b741915aa315',
      timestamp: 1661305372000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x66bE167c36B3b75D1130BBbDec69f9f04E7DA4fC' },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: { type: 'NATIVE_COIN', value: '1000000000000000000' },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x2ee28e1e8a67398c1afa79de4aaae190a078868136fd2dc8f6871ecf44a68261_0x675a33b5668f2af0',
      timestamp: 1638530807000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x68217d15d8d96ddaf32075cfa66b905385d4ffbe25e6692c09ef478757d8f5a5_0x77ef16e29e96d03d',
      timestamp: 1637069854000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x2F3FCe7397927dCA2A64027660012e695E8a2C72' },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99',
          tokenName: 'Basic Attention Token',
          tokenSymbol: 'BAT',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x68217d15d8d96ddaf32075cfa66b905385d4ffbe25e6692c09ef478757d8f5a5_0xfe10b3038159821a',
      timestamp: 1637069854000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x2F3FCe7397927dCA2A64027660012e695E8a2C72' },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x6e894660985207feb7cf89Faf048998c71E8EE89',
          tokenName: 'Augur',
          tokenSymbol: 'REP',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6e894660985207feb7cf89Faf048998c71E8EE89.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x68217d15d8d96ddaf32075cfa66b905385d4ffbe25e6692c09ef478757d8f5a5_0x45f30fd5f411fa08',
      timestamp: 1637069854000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x2F3FCe7397927dCA2A64027660012e695E8a2C72' },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0xddea378A6dDC8AfeC82C36E9b0078826bf9e68B6',
          tokenName: '0x',
          tokenSymbol: 'ZRX',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0xddea378A6dDC8AfeC82C36E9b0078826bf9e68B6.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x68217d15d8d96ddaf32075cfa66b905385d4ffbe25e6692c09ef478757d8f5a5_0x4a2327c8555e6dc1',
      timestamp: 1637069854000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x2F3FCe7397927dCA2A64027660012e695E8a2C72' },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: { type: 'NATIVE_COIN', value: '1000000000000000000' },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x68217d15d8d96ddaf32075cfa66b905385d4ffbe25e6692c09ef478757d8f5a5_0x220d833d3dfb9e06',
      timestamp: 1637069854000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0x2F3FCe7397927dCA2A64027660012e695E8a2C72' },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x6b56832c0d27258ab0c6de39ef6e07032600bcedc71bf24cd4a290e685cbfa9b_0x321c26a651e8b1f1',
      timestamp: 1630010393000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x05c26ebbc05414982bd36d70dfca06b4e10fb354a7ad69426adee7767d09791f_0xda10fe5e7557e20f',
      timestamp: 1626805598000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0xb796e7340ba08081c08ad1eab8136a7d07e2a1224e1cfac2553874647396a2cf_0x742ee4ce346e7451',
      timestamp: 1625198065000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0xadc8f72992c846200f669edeaeccb49e839d5ab8c3ffa2eb8ac4a6f6bf839e13_0xff3b68d5854a123a',
      timestamp: 1623989042000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x84e7f1e1bcd749a84945e8817995851934776c644d463935940047b3ed414a16_0xc4cf7e4538e682b5',
      timestamp: 1623333230000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0xb3b83bf204C458B461de9B0CD2739DB152b4fa5A' },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D',
          tokenName: 'OWL Token',
          tokenSymbol: 'OWL',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x8a9f3713ab7540b9d1c5662412faa63e47345b8d7b51e48f1deb073cc48e0d10_0x988a0a537be69a54',
      timestamp: 1623333155000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: { value: '0xb3b83bf204C458B461de9B0CD2739DB152b4fa5A' },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D',
          tokenName: 'OWL Token',
          tokenSymbol: 'OWL',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x81dfb8e363f824e7ed3c9060dd6068fbd7fdf2c395fe8eb0aac6323a297b42d6_0x79d9a6be66e0732f',
      timestamp: 1622192611000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x63ae1e87fd11255c56b33a4f83e056346f699d41e05f3ff9a8b7112cf8e39dd3_0x96858548c97f0f4e',
      timestamp: 1619268557000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x8d4862121af631a9faad489d3998f8161006751edab08e17f4916887e461292d_0x1346f6b7cfb5b974',
      timestamp: 1619266967000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0xab79a5db314b71f822a568dfff8305ab4608ee0fa5e4b4c7171ec495d5553b90_0xe75bf571b95817cf',
      timestamp: 1619156616000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x8f9fac039a38fd3fbacf07905fc875a18908cb6c9d353f35d6b87356e451df13_0xfbff191e3f3bb638',
      timestamp: 1618545136000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x218455b3d174f84676a03af91bad64ed1987039fad430abc83a9a7e8b63f58ff_0xe5b777d2acf56642',
      timestamp: 1618237415000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0xffb42607b2ff6e78ffa5495106280761216ec5d3dc4b56321117ed35f6ca4776_0x483c62d343815b71',
      timestamp: 1617040986000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x9Ea007843318B9EcD85f93eCC55D4e19143f007A',
          name: 'IdleV4Mock_DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x9Ea007843318B9EcD85f93eCC55D4e19143f007A.png',
        },
        recipient: { value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808' },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
] as TransactionListItem[]

const dateLabelledTxHistoryIncoming = [
  {
    type: 'DATE_LABEL',
    timestamp: 1661305372000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x7985e2b4148583353d05098768a07c8f2d232325689f2dca83242bf5bf36d309_0xe15b741915aa315',
      timestamp: 1661305372000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x66bE167c36B3b75D1130BBbDec69f9f04E7DA4fC',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'NATIVE_COIN',
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1638530807000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x2ee28e1e8a67398c1afa79de4aaae190a078868136fd2dc8f6871ecf44a68261_0x675a33b5668f2af0',
      timestamp: 1638530807000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1637069854000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x68217d15d8d96ddaf32075cfa66b905385d4ffbe25e6692c09ef478757d8f5a5_0x77ef16e29e96d03d',
      timestamp: 1637069854000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x2F3FCe7397927dCA2A64027660012e695E8a2C72',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99',
          tokenName: 'Basic Attention Token',
          tokenSymbol: 'BAT',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0xbF7A7169562078c96f0eC1A8aFD6aE50f12e5A99.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x68217d15d8d96ddaf32075cfa66b905385d4ffbe25e6692c09ef478757d8f5a5_0xfe10b3038159821a',
      timestamp: 1637069854000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x2F3FCe7397927dCA2A64027660012e695E8a2C72',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x6e894660985207feb7cf89Faf048998c71E8EE89',
          tokenName: 'Augur',
          tokenSymbol: 'REP',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6e894660985207feb7cf89Faf048998c71E8EE89.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x68217d15d8d96ddaf32075cfa66b905385d4ffbe25e6692c09ef478757d8f5a5_0x45f30fd5f411fa08',
      timestamp: 1637069854000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x2F3FCe7397927dCA2A64027660012e695E8a2C72',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0xddea378A6dDC8AfeC82C36E9b0078826bf9e68B6',
          tokenName: '0x',
          tokenSymbol: 'ZRX',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0xddea378A6dDC8AfeC82C36E9b0078826bf9e68B6.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x68217d15d8d96ddaf32075cfa66b905385d4ffbe25e6692c09ef478757d8f5a5_0x4a2327c8555e6dc1',
      timestamp: 1637069854000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x2F3FCe7397927dCA2A64027660012e695E8a2C72',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'NATIVE_COIN',
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x68217d15d8d96ddaf32075cfa66b905385d4ffbe25e6692c09ef478757d8f5a5_0x220d833d3dfb9e06',
      timestamp: 1637069854000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x2F3FCe7397927dCA2A64027660012e695E8a2C72',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1630010393000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x6b56832c0d27258ab0c6de39ef6e07032600bcedc71bf24cd4a290e685cbfa9b_0x321c26a651e8b1f1',
      timestamp: 1630010393000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1626805598000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x05c26ebbc05414982bd36d70dfca06b4e10fb354a7ad69426adee7767d09791f_0xda10fe5e7557e20f',
      timestamp: 1626805598000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1625198065000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0xb796e7340ba08081c08ad1eab8136a7d07e2a1224e1cfac2553874647396a2cf_0x742ee4ce346e7451',
      timestamp: 1625198065000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1623989042000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0xadc8f72992c846200f669edeaeccb49e839d5ab8c3ffa2eb8ac4a6f6bf839e13_0xff3b68d5854a123a',
      timestamp: 1623989042000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1623333230000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x84e7f1e1bcd749a84945e8817995851934776c644d463935940047b3ed414a16_0xc4cf7e4538e682b5',
      timestamp: 1623333230000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0xb3b83bf204C458B461de9B0CD2739DB152b4fa5A',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D',
          tokenName: 'OWL Token',
          tokenSymbol: 'OWL',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x8a9f3713ab7540b9d1c5662412faa63e47345b8d7b51e48f1deb073cc48e0d10_0x988a0a537be69a54',
      timestamp: 1623333155000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0xb3b83bf204C458B461de9B0CD2739DB152b4fa5A',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D',
          tokenName: 'OWL Token',
          tokenSymbol: 'OWL',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1622192611000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x81dfb8e363f824e7ed3c9060dd6068fbd7fdf2c395fe8eb0aac6323a297b42d6_0x79d9a6be66e0732f',
      timestamp: 1622192611000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1619268557000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x63ae1e87fd11255c56b33a4f83e056346f699d41e05f3ff9a8b7112cf8e39dd3_0x96858548c97f0f4e',
      timestamp: 1619268557000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x8d4862121af631a9faad489d3998f8161006751edab08e17f4916887e461292d_0x1346f6b7cfb5b974',
      timestamp: 1619266967000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1619156616000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0xab79a5db314b71f822a568dfff8305ab4608ee0fa5e4b4c7171ec495d5553b90_0xe75bf571b95817cf',
      timestamp: 1619156616000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1618545136000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x8f9fac039a38fd3fbacf07905fc875a18908cb6c9d353f35d6b87356e451df13_0xfbff191e3f3bb638',
      timestamp: 1618545136000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1618237415000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0x218455b3d174f84676a03af91bad64ed1987039fad430abc83a9a7e8b63f58ff_0xe5b777d2acf56642',
      timestamp: 1618237415000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x6D7F0754FFeb405d23C51CE938289d4835bE3b14',
          name: 'Compound Dai 📈',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x6D7F0754FFeb405d23C51CE938289d4835bE3b14.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
  {
    type: 'DATE_LABEL',
    timestamp: 1617040986000,
  },
  {
    type: 'TRANSACTION',
    transaction: {
      id: 'ethereum_0x9913B9180C20C6b0F21B6480c84422F6ebc4B808_0xffb42607b2ff6e78ffa5495106280761216ec5d3dc4b56321117ed35f6ca4776_0x483c62d343815b71',
      timestamp: 1617040986000,
      txStatus: 'SUCCESS',
      txInfo: {
        type: 'Transfer',
        sender: {
          value: '0x9Ea007843318B9EcD85f93eCC55D4e19143f007A',
          name: 'IdleV4Mock_DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x9Ea007843318B9EcD85f93eCC55D4e19143f007A.png',
        },
        recipient: {
          value: '0x9913B9180C20C6b0F21B6480c84422F6ebc4B808',
        },
        direction: 'INCOMING',
        transferInfo: {
          type: 'ERC20',
          tokenAddress: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa',
          tokenName: 'Dai',
          tokenSymbol: 'DAI',
          logoUri:
            'https://safe-transaction-assets.gnosis-safe.io/tokens/logos/0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa.png',
          decimals: 18,
          value: '1000000000000000000',
        },
      },
    },
    conflictType: 'None',
  },
] as TransactionListItem[]

describe('Transaction grouping', () => {
  describe('groupTxItems', () => {
    it('should group conflicting transactions', () => {
      const result = _groupTxItems(conflictingTxQueue)
      expect(result).toEqual(groupedConflictingTxQueue)
    })

    it('should return non-conflicting transaction lists as is', () => {
      const result = _groupTxItems(txQueue)
      expect(result).toEqual(txQueue)
    })
  })

  describe('addDateLabels', () => {
    it('should return `items` as is if it is an empty array', () => {
      const result = _addDateLabels([])
      expect(result).toEqual([])
    })

    it('should return `items` as is if it contains no transactions', () => {
      const items = [
        { type: 'LABEL', label: 'Next' },
        { type: 'CONFLICT_HEADER', nonce: 1571 },
      ] as TransactionListItem[]

      const result = _addDateLabels(items)
      expect(result).toEqual(items)
    })

    it('should prepend and nest date labels between transactions on different days', () => {
      const result = _addDateLabels(txHistoryIncoming)
      expect(result).toEqual(dateLabelledTxHistoryIncoming)
    })
  })

  describe('useGroupedTxs', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('should group conflicting transactions', () => {
      const { result } = renderHook(() => useGroupedTxs(conflictingTxQueue))
      expect(result.current).toEqual(groupedConflictingTxQueue)
    })

    it('should add date labels if there is a filter', () => {
      jest
        .spyOn(txFilter, 'useTxFilter')
        .mockReturnValue([{ type: 'Incoming' as txFilter.TxFilterType, filter: {} }, jest.fn])

      const { result } = renderHook(() => useGroupedTxs(txHistoryIncoming))
      expect(result.current).toEqual(dateLabelledTxHistoryIncoming)
    })

    it('should not add date labels if there is no filter', () => {
      jest.spyOn(txFilter, 'useTxFilter').mockReturnValue([null, jest.fn])

      const { result } = renderHook(() => useGroupedTxs(txHistoryIncoming))
      expect(result.current).toEqual(txHistoryIncoming)
    })
  })
})
