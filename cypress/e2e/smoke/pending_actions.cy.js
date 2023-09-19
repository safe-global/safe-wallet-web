import * as constants from '../../support/constants'
import * as safe from '../pages/load_safe.pages'
import * as main from '../pages/main.page'

describe('Pending actions', () => {
  before(() => {
    cy.visit(constants.welcomeUrl)
    main.acceptCookies()
  })

  beforeEach(() => {
    // Uses the previously saved local storage
    // to preserve the wallet connection between tests
    cy.restoreLocalStorageCache()
  })

  afterEach(() => {
    cy.saveLocalStorageCache()
  })

  it('should add the Safe with the pending actions', () => {
    safe.openLoadSafeForm()
    safe.inputAddress(constants.TEST_SAFE)
    safe.clickOnNextBtn()
    safe.verifyOwnersModalIsVisible()
    safe.clickOnNextBtn()
    safe.clickOnAddBtn()
  })

  it('should display the pending actions in the Safe list sidebar', () => {
    safe.openSidebar()
    safe.verifyAddressInsidebar(constants.SIDEBAR_ADDRESS)
    safe.verifySidebarIconNumber(1)
    safe.clickOnPendingActions()
    //cy.get('img[alt="E2E Wallet logo"]').next().contains('2').should('exist')
  })

  it('should have the right number of queued and signable transactions', () => {
    safe.verifyTransactionSectionIsVisible()
    safe.verifyNumberOfTransactions(1, 1)
  })
})
