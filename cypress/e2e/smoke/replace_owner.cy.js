import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../pages/owners.pages'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

describe('[SMOKE] Replace Owners tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.visit(constants.setupUrl + staticSafes.SEP_STATIC_SAFE_4)
    cy.clearLocalStorage()
    main.acceptCookies()
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
  })

  it('[SMOKE] Verify that "Replace" icon is visible', () => {
    owner.verifyReplaceBtnIsEnabled()
  })

  // TODO: Remove "tooltip" from title
  it('[SMOKE] Verify Tooltip displays correct message for Non-Owner', () => {
    cy.visit(constants.setupUrl + staticSafes.SEP_STATIC_SAFE_3)
    owner.waitForConnectionStatus()
    owner.verifyReplaceBtnIsDisabled()
  })

  it('[SMOKE] Verify that the owner replacement form is opened', () => {
    owner.waitForConnectionStatus()
    owner.openReplaceOwnerWindow()
  })
})
