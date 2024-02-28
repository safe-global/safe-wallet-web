import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as createwallet from '../pages/create_wallet.pages'
import * as owner from '../pages/owners.pages'

describe('[SMOKE] Safe creation tests', () => {
  beforeEach(() => {
    cy.visit(constants.welcomeUrl + '?chain=sep')
    cy.clearLocalStorage()
    main.acceptCookies()
  })
  it('[SMOKE] Verify a Wallet can be connected', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    owner.clickOnWalletExpandMoreIcon()
    owner.clickOnDisconnectBtn()
    createwallet.clickOnConnectWalletBtn()
    createwallet.connectWallet()
    owner.waitForConnectionStatus()
  })

  it('[SMOKE] Verify that a new Wallet has default name related to the selected network', () => {
    owner.waitForConnectionStatus()
    createwallet.clickOnContinueWithWalletBtn()
    createwallet.clickOnCreateNewSafeBtn()
    createwallet.verifyDefaultWalletName(createwallet.defaultSepoliaPlaceholder)
  })

  it('[SMOKE] Verify Add and Remove Owner Row works as expected', () => {
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
