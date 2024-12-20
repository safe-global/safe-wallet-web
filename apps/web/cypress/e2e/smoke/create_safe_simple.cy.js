import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as createwallet from '../pages/create_wallet.pages'
import * as owner from '../pages/owners.pages'
import * as wallet from '../../support/utils/wallet.js'

const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY

describe('[SMOKE] Safe creation tests', () => {
  beforeEach(() => {
    cy.visit(constants.welcomeUrl + '?chain=sep')
  })
  it('[SMOKE] Verify a Wallet can be connected', () => {
    wallet.connectSigner(signer)
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    owner.clickOnWalletExpandMoreIcon()
    owner.clickOnDisconnectBtn()
    wallet.connectSigner(signer)
    owner.waitForConnectionStatus()
  })

  it('[SMOKE] Verify that a new Wallet has default name related to the selected network', () => {
    wallet.connectSigner(signer)
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.verifyDefaultWalletName(createwallet.defaultSepoliaPlaceholder)
  })

  it('[SMOKE] Verify Add and Remove Owner Row works as expected', () => {
    wallet.connectSigner(signer)
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.clickOnNextBtn()
    createwallet.clickOnAddNewOwnerBtn()
    owner.verifyNumberOfOwners(2)
    owner.verifyExistingOwnerAddress(1, '')
    owner.verifyExistingOwnerName(1, '')
    createwallet.removeOwner(0)
    main.verifyElementsCount(createwallet.removeOwnerBtn, 0)
    createwallet.clickOnAddNewOwnerBtn()
    owner.verifyNumberOfOwners(2)
  })

  it('[SMOKE] Verify Threshold Setup', () => {
    wallet.connectSigner(signer)
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.clickOnNextBtn()
    createwallet.clickOnAddNewOwnerBtn()
    createwallet.clickOnAddNewOwnerBtn()
    owner.verifyNumberOfOwners(3)
    createwallet.clickOnAddNewOwnerBtn()
    owner.verifyNumberOfOwners(4)
    owner.verifyThresholdLimit(1, 4)
    createwallet.updateThreshold(3)
    createwallet.removeOwner(1)
    owner.verifyThresholdLimit(1, 3)
    createwallet.removeOwner(1)
    owner.verifyThresholdLimit(1, 2)
    createwallet.updateThreshold(1)
  })
})
