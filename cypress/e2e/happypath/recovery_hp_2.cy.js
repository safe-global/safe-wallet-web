import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as owner from '../pages/owners.pages'
import * as recovery from '../pages/recovery.pages'
import * as addressbook from '../pages/address_book.page'

describe('Recovery happy path tests 2', () => {
  beforeEach(() => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_24_RECOVERY_2)
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  // Check that recoverer can start and complete the process if not cancelled by the owner
  it('Recovery setup happy path 2', { defaultCommandTimeout: 300000 }, () => {
    owner.waitForConnectionStatus()
    recovery.postponeRecovery()

    main.getElementText(addressbook.tableContainer).then((text) => {
      let owner = constants.SPENDING_LIMIT_ADDRESS_2
      if (text.includes(constants.SPENDING_LIMIT_ADDRESS_2)) {
        owner = constants.SEPOLIA_OWNER_2
      }

      cy.visit(constants.homeUrl + constants.SEPOLIA_TEST_SAFE_24_RECOVERY_2)
      recovery.clickOnStartRecoveryBtn()
      recovery.enterOwnerAddress(owner)
      recovery.clickOnNextBtn()
      recovery.clickOnRecoveryExecuteBtn()
      recovery.clickOnGoToQueueBtn()
      recovery.clickOnRecoveryExecuteBtn()
      recovery.verifyTxNotInQueue()
      cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_24_RECOVERY_2)
      main.verifyElementsCount(addressbook.tableContainer, 1)
      cy.wait(10000)
      main.getElementText(addressbook.tableContainer).then((text) => {
        expect(text).to.contain(owner)
      })
    })
  })
})
