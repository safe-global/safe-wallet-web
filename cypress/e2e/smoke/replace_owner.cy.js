import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../pages/owners.pages'

describe('[SMOKE] Replace Owners tests', () => {
  beforeEach(() => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_1)
    cy.clearLocalStorage()
    main.acceptCookies()
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
  })

  it('[SMOKE] Verify that "Replace" icon is visible', () => {
    owner.verifyReplaceBtnIsEnabled()
  })

  // TODO: Remove "tooltip" from title
  it('[SMOKE] Verify Tooltip displays correct message for Non-Owner', () => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_2)
    owner.waitForConnectionStatus()
    owner.verifyReplaceBtnIsDisabled()
  })

  it('[SMOKE] Verify that the owner replacement form is opened', () => {
    owner.waitForConnectionStatus()
    owner.openReplaceOwnerWindow()
  })
})
