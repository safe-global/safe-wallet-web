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

const transferAmount = '1'

const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY

const netwrok = 'sepolia'
const network_pref = 'sep:'
const unit_eth = 'ether'
let apiKit, outgoingSafeAddress

let safes = []
let safesData = []

const provider = new ethers.InfuraProvider(netwrok, Cypress.env('INFURA_API_KEY'))
const privateKeys = [walletCredentials.OWNER_1_PRIVATE_KEY, walletCredentials.OWNER_2_PRIVATE_KEY]
const walletAddress = [walletCredentials.OWNER_1_WALLET_ADDRESS]
const signers = createSigners(privateKeys, provider)

const contractAddress = contracts.token_qtrust
const tokenContract = new ethers.Contract(contractAddress, abi_qtrust, provider)

function visit(url) {
  cy.visit(url)
}

// TODO: Relay only allows 5 txs per day.
describe('Send funds with relay happy path tests 3', { defaultCommandTimeout: 300000 }, () => {
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

    outgoingSafeAddress = safesData.SEP_FUNDS_SAFE_8.substring(4)

    const safeConfigurations = [
      { signer: privateKeys[0], safeAddress: outgoingSafeAddress, provider },
      { signer: privateKeys[1], safeAddress: outgoingSafeAddress, provider },
    ]

    safes = await createSafes(safeConfigurations)
  })

  it('Verify tx creation and execution of non-native token with with relay', () => {
    cy.wait(2000)
    const originatingSafe = safesData.SEP_FUNDS_SAFE_2.substring(4)
    const amount = ethers.parseUnits(transferAmount, unit_eth).toString()

    function executeTransactionFlow(fromSafe, toSafe) {
      visit(constants.BALANCE_URL + fromSafe)
      wallet.connectSigner(signer)
      assets.selectTokenList(assets.tokenListOptions.allTokens)
      assets.clickOnSendBtn(1)

      loadsafe.inputOwnerAddress(0, toSafe)
      assets.enterAmount(1)
      navigation.clickOnNewTxBtnS()
      tx.executeFlow_2()
      cy.wait(5000)
    }

    cy.wrap(null)
      .then(() => {
        return main.fetchCurrentNonce(network_pref + originatingSafe)
      })
      .then(async (currentNonce) => {
        return main.getRelayRemainingAttempts(originatingSafe).then(async (remainingAttempts) => {
          if (remainingAttempts < 1) {
            throw new Error(main.noRelayAttemptsError)
          }
          executeTransactionFlow(originatingSafe, walletAddress.toString(), transferAmount)

          const contractWithWallet = tokenContract.connect(signers[0])
          const tx = await contractWithWallet.transfer(originatingSafe, amount, {
            gasLimit: 200000,
          })

          await tx.wait()
          main.verifyNonceChange(network_pref + originatingSafe, currentNonce + 1)
          navigation.clickOnWalletExpandMoreIcon()
          navigation.clickOnDisconnectBtn()
        })
      })
  })
})
