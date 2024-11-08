import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as assets from '../pages/assets.pages.js'
import * as loadsafe from '../pages/load_safe.pages.js'
import * as navigation from '../pages/navigation.page.js'
import * as tx from '../pages/transactions.page.js'
import * as ls from '../../support/localstorage_data.js'
import { ethers } from 'ethers'
import SafeApiKit from '@safe-global/api-kit'
import { createSigners } from '../../support/api/utils_ether.js'
import { createSafes } from '../../support/api/utils_protocolkit.js'
import { contracts, abi_qtrust, abi_nft_pc2 } from '../../support/api/contracts.js'
import * as wallet from '../../support/utils/wallet.js'
import * as fundSafes from '../../fixtures/safes/funds.json'

const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY

const tokenAmount2 = '0.00001'
const netwrok = 'sepolia'
const network_pref = 'sep:'
const unit_eth = 'ether'

let apiKit, protocolKitOwner1_S3, protocolKitOwner2_S3, outgoingSafeAddress

let safes = []
let safesData = []

const provider = new ethers.InfuraProvider(netwrok, Cypress.env('INFURA_API_KEY'))
const privateKeys = [walletCredentials.OWNER_1_PRIVATE_KEY, walletCredentials.OWNER_2_PRIVATE_KEY]
const walletAddress = [walletCredentials.OWNER_1_WALLET_ADDRESS]
const signers = createSigners(privateKeys, provider)

const owner1Signer = signers[0]

function visit(url) {
  cy.visit(url)
}

describe('Send funds with connected signer happy path tests 2', { defaultCommandTimeout: 60000 }, () => {
  before(async () => {
    cy.clearLocalStorage().then(() => {
      main.addToLocalStorage(constants.localStorageKeys.SAFE_v2_cookies, ls.cookies.acceptedCookies)
      main.addToLocalStorage(
        constants.localStorageKeys.SAFE_v2__tokenlist_onboarding,
        ls.cookies.acceptedTokenListOnboarding,
      )
    })
    safesData = fundSafes
    apiKit = new SafeApiKit({
      chainId: BigInt(1),
      txServiceUrl: constants.stagingTxServiceUrl,
    })

    outgoingSafeAddress = safesData.SEP_FUNDS_SAFE_6.substring(4)

    const safeConfigurations = [
      { signer: walletCredentials.OWNER_1_PRIVATE_KEY, safeAddress: outgoingSafeAddress, provider },
      { signer: walletCredentials.OWNER_2_PRIVATE_KEY, safeAddress: outgoingSafeAddress, provider },
    ]

    safes = await createSafes(safeConfigurations)

    protocolKitOwner1_S3 = safes[0]
    protocolKitOwner2_S3 = safes[1]
  })

  it('Verify tx creation and execution of native token with connected signer', () => {
    cy.wait(2000)
    const targetSafe = safesData.SEP_FUNDS_SAFE_12.substring(4)
    function executeTransactionFlow(fromSafe, toSafe, tokenAmount) {
      visit(constants.BALANCE_URL + fromSafe)
      wallet.connectSigner(signer)
      assets.clickOnSendBtn(0)
      loadsafe.inputOwnerAddress(0, toSafe)
      assets.checkSelectedToken(constants.tokenAbbreviation.sep)
      assets.enterAmount(tokenAmount)
      navigation.clickOnNewTxBtnS()
      tx.executeFlow_1()
      cy.wait(5000)
    }
    cy.wrap(null)
      .then(() => {
        return main.fetchCurrentNonce(network_pref + targetSafe)
      })
      .then(async (currentNonce) => {
        executeTransactionFlow(targetSafe, walletAddress.toString(), tokenAmount2)
        const amount = ethers.parseUnits(tokenAmount2, unit_eth).toString()
        const safeTransactionData = {
          to: targetSafe,
          data: '0x',
          value: amount.toString(),
        }

        const safeTransaction = await protocolKitOwner1_S3.createTransaction({ transactions: [safeTransactionData] })
        const safeTxHash = await protocolKitOwner1_S3.getTransactionHash(safeTransaction)
        const senderSignature = await protocolKitOwner1_S3.signHash(safeTxHash)
        const safeAddress = outgoingSafeAddress

        await apiKit.proposeTransaction({
          safeAddress,
          safeTransactionData: safeTransaction.data,
          safeTxHash,
          senderAddress: await owner1Signer.getAddress(),
          senderSignature: senderSignature.data,
        })

        const pendingTransactions = await apiKit.getPendingTransactions(safeAddress)
        const safeTxHashofExistingTx = pendingTransactions.results[0].safeTxHash

        const signature = await protocolKitOwner2_S3.signHash(safeTxHashofExistingTx)
        await apiKit.confirmTransaction(safeTxHashofExistingTx, signature.data)

        const safeTx = await apiKit.getTransaction(safeTxHashofExistingTx)
        await protocolKitOwner2_S3.executeTransaction(safeTx)
        main.verifyNonceChange(network_pref + targetSafe, currentNonce + 1)
        navigation.clickOnWalletExpandMoreIcon()
        navigation.clickOnDisconnectBtn()
      })
  })
})
