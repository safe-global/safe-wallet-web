import { safeTxBuilder, safeTxDataBuilder } from '@/tests/builders/safeTx'
import { EURE_TOKEN_ADDRESS, getGnosisPayTxWarnings } from './getGnosisPayTxWarnings'
import { safeInfoBuilder } from '@/tests/builders/safe'
import { getMultiSendCallOnlyContractDeployment } from '@safe-global/protocol-kit/dist/src/contracts/safeDeploymentContracts'
import { encodeMultiSendData } from '@safe-global/protocol-kit'
import { faker } from '@faker-js/faker'
import { ERC20__factory, Multi_send__factory } from '@/types/contracts'
import { Gnosis_safe__factory } from '@/types/contracts/factories/@safe-global/safe-deployments/dist/assets/v1.3.0'
import { SENTINEL_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import { Interface } from 'ethers'
import { type MetaTransactionData } from '@safe-global/safe-core-sdk-types'

const ERC20Interface = ERC20__factory.createInterface()
const SafeInterface = Gnosis_safe__factory.createInterface()
const MultisendInterface = Multi_send__factory.createInterface()

describe('getGnosisPayTxWarnings', () => {
  describe('should return no warnings', () => {
    it('for undefined tx', () => {
      expect(getGnosisPayTxWarnings(undefined, safeInfoBuilder().build())).toHaveLength(0)
    })
    it('for txs without warnings', () => {
      expect(getGnosisPayTxWarnings(safeTxBuilder().build(), safeInfoBuilder().build())).toHaveLength(0)
    })

    it('for multisends without warnings', () => {
      expect(
        getGnosisPayTxWarnings(
          safeTxBuilder()
            .with({
              data: safeTxDataBuilder()
                .with({
                  to: getMultiSendCallOnlyContractDeployment('1.3.0', 100n)?.defaultAddress,
                  data: MultisendInterface.encodeFunctionData('multiSend', [
                    encodeMultiSendData([
                      {
                        to: faker.finance.ethereumAddress(),
                        value: '0x00',
                        data: '0x00',
                        operation: 0,
                      },
                      {
                        to: faker.finance.ethereumAddress(),
                        value: '0x00',
                        data: '0x00',
                        operation: 0,
                      },
                    ]),
                  ]),
                })
                .build(),
            })
            .build(),
          safeInfoBuilder().build(),
        ),
      ).toHaveLength(0)
    })
  })

  it('should return warnings when adding / replacing owners', () => {
    const safeInfo = safeInfoBuilder().build()
    expect(
      getGnosisPayTxWarnings(
        safeTxBuilder()
          .with({
            data: safeTxDataBuilder()
              .with({ to: safeInfo.address.value })
              .with({
                data: SafeInterface.encodeFunctionData('addOwnerWithThreshold', [faker.finance.ethereumAddress(), 1]),
              })
              .build(),
          })
          .build(),
        safeInfo,
      ),
    ).toHaveLength(1)

    expect(
      getGnosisPayTxWarnings(
        safeTxBuilder()
          .with({
            data: safeTxDataBuilder()
              .with({ to: safeInfo.address.value })
              .with({
                data: SafeInterface.encodeFunctionData('swapOwner', [
                  safeInfo.owners[0].value,
                  faker.finance.ethereumAddress(),
                  SENTINEL_ADDRESS,
                ]),
              })
              .build(),
          })
          .build(),
        safeInfo,
      ),
    ).toHaveLength(1)
  })

  it('should return EURe approval warnings', () => {
    expect(
      getGnosisPayTxWarnings(
        safeTxBuilder()
          .with({
            data: safeTxDataBuilder()
              .with({ to: EURE_TOKEN_ADDRESS })
              .with({ data: ERC20Interface.encodeFunctionData('approve', [faker.finance.ethereumAddress(), 420n]) })
              .build(),
          })
          .build(),
        safeInfoBuilder().build(),
      ),
    ).toHaveLength(1)

    expect(
      getGnosisPayTxWarnings(
        safeTxBuilder()
          .with({
            data: safeTxDataBuilder()
              .with({ to: EURE_TOKEN_ADDRESS })
              .with({
                data: ERC20Interface.encodeFunctionData('increaseAllowance', [faker.finance.ethereumAddress(), 420n]),
              })
              .build(),
          })
          .build(),
        safeInfoBuilder().build(),
      ),
    ).toHaveLength(1)
  })

  it('should return warnings when enabling / disabling modules', () => {
    const safeInfo = safeInfoBuilder().build()
    expect(
      getGnosisPayTxWarnings(
        safeTxBuilder()
          .with({
            data: safeTxDataBuilder()
              .with({ to: safeInfo.address.value })
              .with({
                data: SafeInterface.encodeFunctionData('enableModule', [faker.finance.ethereumAddress()]),
              })
              .build(),
          })
          .build(),
        safeInfo,
      ),
    ).toHaveLength(1)

    expect(
      getGnosisPayTxWarnings(
        safeTxBuilder()
          .with({
            data: safeTxDataBuilder()
              .with({ to: safeInfo.address.value })
              .with({
                data: SafeInterface.encodeFunctionData('disableModule', [
                  SENTINEL_ADDRESS,
                  faker.finance.ethereumAddress(),
                ]),
              })
              .build(),
          })
          .build(),
        safeInfo,
      ),
    ).toHaveLength(1)
  })

  it('should return warnings when setting a guard', () => {
    const safeInfo = safeInfoBuilder().build()
    expect(
      getGnosisPayTxWarnings(
        safeTxBuilder()
          .with({
            data: safeTxDataBuilder()
              .with({ to: safeInfo.address.value })
              .with({
                data: SafeInterface.encodeFunctionData('setGuard', [faker.finance.ethereumAddress()]),
              })
              .build(),
          })
          .build(),
        safeInfo,
      ),
    ).toHaveLength(1)
  })

  it('should return warnings when tampering with the DelayModifier', () => {
    const delayInterface = new Interface(['function setTxCooldown(uint256)', 'function setTxExpiration(uint256)'])

    const mockDelayModifier = faker.finance.ethereumAddress()
    const safeInfo = safeInfoBuilder()
      .with({
        modules: [
          {
            value: mockDelayModifier,
          },
        ],
      })
      .build()
    expect(
      getGnosisPayTxWarnings(
        safeTxBuilder()
          .with({
            data: safeTxDataBuilder()
              .with({ to: mockDelayModifier })
              .with({
                data: delayInterface.encodeFunctionData('setTxCooldown', [1n]),
              })
              .build(),
          })
          .build(),
        safeInfo,
      ),
    ).toHaveLength(1)

    expect(
      getGnosisPayTxWarnings(
        safeTxBuilder()
          .with({
            data: safeTxDataBuilder()
              .with({ to: mockDelayModifier })
              .with({
                data: delayInterface.encodeFunctionData('setTxExpiration', [10000000000n]),
              })
              .build(),
          })
          .build(),
        safeInfo,
      ),
    ).toHaveLength(1)
  })

  it('should return multiple warnings for multisends with multiple issues', () => {
    const delayInterface = new Interface(['function setTxCooldown(uint256)', 'function setTxExpiration(uint256)'])

    const txs: MetaTransactionData[] = []

    const mockDelayModifier = faker.finance.ethereumAddress()

    const safeInfo = safeInfoBuilder()
      .with({
        modules: [
          {
            value: mockDelayModifier,
          },
        ],
      })
      .build()
    txs.push({
      to: mockDelayModifier,
      data: delayInterface.encodeFunctionData('setTxCooldown', [1n]),
      value: '0x00',
      operation: 0,
    })
    txs.push({
      to: safeInfo.address.value,
      data: SafeInterface.encodeFunctionData('addOwnerWithThreshold', [faker.finance.ethereumAddress(), 1]),
      value: '0x00',
      operation: 0,
    })
    txs.push({
      to: EURE_TOKEN_ADDRESS,
      data: ERC20Interface.encodeFunctionData('approve', [faker.finance.ethereumAddress(), 900n]),
      value: '0x00',
      operation: 0,
    })
    expect(
      getGnosisPayTxWarnings(
        safeTxBuilder()
          .with({
            data: safeTxDataBuilder()
              .with({
                to: getMultiSendCallOnlyContractDeployment('1.3.0', 100n)?.defaultAddress,
                data: MultisendInterface.encodeFunctionData('multiSend', [encodeMultiSendData(txs)]),
                value: '0x00',
              })
              .build(),
          })
          .build(),
        safeInfo,
      ),
    ).toHaveLength(3)
  })
})
