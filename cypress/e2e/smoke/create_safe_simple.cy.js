import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as createwallet from '../pages/create_wallet.pages'

const safeName = 'Test safe name'
const ownerName = 'Test Owner Name'
const ownerName2 = 'Test Owner Name 2'

describe('Create Safe form', () => {
  it('should navigate to the form', () => {
    cy.clearLocalStorage()
    cy.visit(constants.welcomeUrl)
    main.acceptCookies()
    main.verifyGoerliWalletHeader()
    createwallet.clickOnCreateNewAccuntBtn()
  })

  it('should allow setting a name', () => {
    createwallet.typeWalletName(safeName)
  })

  it('should allow changing the network', () => {
    createwallet.selectNetwork(constants.networks.ethereum)
    createwallet.selectNetwork(constants.networks.goerli, true)
    createwallet.clickOnNextBtn()
  })

  it('should display a default owner and threshold', () => {
    createwallet.verifyOwnerAddress(constants.DEFAULT_OWNER_ADDRESS, 0)
    createwallet.verifyThreshold(1)
  })

  it('should allow changing the owner name', () => {
    createwallet.typeOwnerName(ownerName, 0)
    cy.contains('button', 'Back').click()
    cy.contains('button', 'Next').click()
    createwallet.verifyOwnerName(ownerName, 0)
  })

  it('should add a new owner and update threshold', () => {
    createwallet.addNewOwner(ownerName2, constants.EOA, 1)
    createwallet.updateThreshold(2)
  })

  it('should remove an owner and update threshold', () => {
    createwallet.removeOwner(0)
    createwallet.verifyThreshold(1)
    createwallet.clickOnNextBtn()
  })

  it('should display summary on review page', () => {
    createwallet.verifySummaryData(safeName, constants.DEFAULT_OWNER_ADDRESS, 1, 1)
  })
})
