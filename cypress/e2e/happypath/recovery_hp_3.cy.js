import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as ownerP from '../pages/owners.pages'
import * as recovery from '../pages/recovery.pages'
import * as tx from '../pages/transactions.page'

describe('Recovery happy path tests 3', () => {
  beforeEach(() => {
    cy.visit(constants.homeUrl + constants.SEPOLIA_TEST_SAFE_25_RECOVERY_3)
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  // Check that an owner can cancel account recovery tx
  it.skip('Recovery setup happy path 3', { defaultCommandTimeout: 300000 }, () => {
    main.fetchSafeData(constants.SEPOLIA_TEST_SAFE_25_RECOVERY_3.substring(4)).then((response) => {
      expect(response.status).to.eq(200)
      console.log(response.body)
      expect(response.body).to.have.property('owners')

      const owners = response.body.owners

      let owner = constants.SPENDING_LIMIT_ADDRESS_2
      if (owners.includes(constants.SPENDING_LIMIT_ADDRESS_2)) {
        owner = constants.SEPOLIA_OWNER_2
      }

      ownerP.waitForConnectionStatus()
      recovery.postponeRecovery()

      recovery.clickOnStartRecoveryBtn()
      recovery.enterOwnerAddress(owner)
      recovery.clickOnNextBtn()
      cy.wait(1000)
      recovery.clickOnRecoveryExecuteBtn()
      cy.wait(1000)
      recovery.clickOnGoToQueueBtn()
      cy.wait(1000)
      recovery.cancelRecoveryTx()

      tx.selectExecuteNow()
      tx.selectConnectedWalletOption()
      recovery.clickOnExecuteRecoveryCancelBtn()
      tx.waitForTxToComplete()
      tx.clickOnFinishBtn()
      cy.wait(1000)

      main.fetchSafeData(constants.SEPOLIA_TEST_SAFE_25_RECOVERY_3.substring(4)).then((response) => {
        const owners = response.body.owners
        expect(owners).to.include(constants.SPENDING_LIMIT_ADDRESS_2)
      })
    })
  })
})
