import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as owner from '../pages/owners.pages'
import * as recovery from '../pages/recovery.pages'
import * as addressbook from '../pages/address_book.page'
import * as tx from '../pages/transactions.page'

describe('Recovery happy path tests 3', () => {
  beforeEach(() => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_25_RECOVERY_3)
    cy.clearLocalStorage()
    main.acceptCookies()
  })
  //
  // Check that an owner can cancel account recovery tx
  it('Recovery setup happy path 3', { defaultCommandTimeout: 300000 }, () => {
    owner.waitForConnectionStatus()
    recovery.postponeRecovery()

    main.getElementText(addressbook.tableContainer).then((text) => {
      let owner = constants.SPENDING_LIMIT_ADDRESS_2
      if (text.includes(constants.SPENDING_LIMIT_ADDRESS_2)) {
        owner = constants.SEPOLIA_OWNER_2
      }
      cy.visit(constants.homeUrl + constants.SEPOLIA_TEST_SAFE_25_RECOVERY_3)
      recovery.clickOnStartRecoveryBtn()
      recovery.enterOwnerAddress(owner)
      recovery.clickOnNextBtn()
      recovery.clickOnRecoveryExecuteBtn()
      recovery.clickOnGoToQueueBtn()
      recovery.cancelRecoveryTx()

      tx.selectExecuteNow()
      tx.selectConnectedWalletOption()
      recovery.clickOnExecuteRecoveryCancelBtn()
      tx.waitForTxToComplete()
      tx.clickOnFinishBtn()

      cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_25_RECOVERY_3)
      main.verifyElementsCount(addressbook.tableContainer, 1)
      cy.wait(1000)
      main.getElementText(addressbook.tableContainer).then((text) => {
        expect(text).to.contain(constants.DEFAULT_OWNER_ADDRESS)
      })
    })
  })
})
