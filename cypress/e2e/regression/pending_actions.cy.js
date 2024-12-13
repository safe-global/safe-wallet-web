import * as constants from '../../support/constants'
import * as safe from '../pages/load_safe.pages'

describe('Pending actions tests', () => {
  before(() => {
    cy.visit(constants.welcomeUrl)
    // main.acceptCookies()
  })

  //TODO: Discuss test logic

  beforeEach(() => {
    // Uses the previously saved local storage
    // to preserve the wallet connection between tests
    cy.restoreLocalStorageCache()
  })

  afterEach(() => {
    cy.saveLocalStorageCache()
  })

  it.skip('should add the Safe with the pending actions', () => {
    safe.openLoadSafeForm()
    safe.inputAddress(constants.TEST_SAFE)
    safe.clickOnNextBtn()
    safe.verifyOwnersModalIsVisible()
    safe.clickOnNextBtn()
    safe.clickOnAddBtn()
  })

  it.skip('should display the pending actions in the Safe list sidebar', () => {
    safe.openSidebar()
    safe.verifyAddressInsidebar(constants.SIDEBAR_ADDRESS)
    safe.verifySidebarIconNumber(1)
    safe.clickOnPendingActions()
    //cy.get('img[alt="E2E Wallet logo"]').next().contains('2').should('exist')
  })

  it.skip('should have the right number of queued and signable transactions', () => {
    safe.verifyTransactionSectionIsVisible()
    safe.verifyNumberOfTransactions(1, 1)
  })
})
