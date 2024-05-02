import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as owner from '../pages/owners.pages'
import * as recovery from '../pages/recovery.pages'
import * as tx from '../pages/transactions.page'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let recoverySafes = []
//
describe('Recovery happy path tests 1', () => {
  before(async () => {
    recoverySafes = await getSafes(CATEGORIES.recovery)
  })

  beforeEach(() => {
    cy.visit(constants.securityUrl + recoverySafes.SEP_RECOVERY_SAFE_1)
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  // Check that recovery can be setup and removed
  it('Recovery setup happy path 1', () => {
    owner.waitForConnectionStatus()
    cy.reload()
    recovery.clearRecoverers()
    recovery.clickOnSetupRecoveryBtn()
    recovery.clickOnSetupRecoveryModalBtn()
    recovery.clickOnNextBtn()
    recovery.enterRecovererAddress(constants.SEPOLIA_OWNER_2)
    recovery.agreeToTerms()
    recovery.clickOnNextBtn()
    tx.executeFlow_1()
    recovery.verifyRecovererAdded([constants.SEPOLIA_OWNER_2_SHORT])

    recovery.clearRecoverers()

    // recovery.removeRecoverer(0, constants.SEPOLIA_OWNER_2)
    // recovery.clickOnNextBtn()
    // tx.executeFlow_1()

    recovery.getSetupRecoveryBtn()
  })
})
