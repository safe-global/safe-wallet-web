import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createTx from '../pages/create_tx.pages'

describe('Transaction history tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.transactionsHistoryUrl + constants.SEPOLIA_TEST_SAFE_5)

    // So that tests that rely on this feature don't randomly fail
    cy.window().then((win) => win.localStorage.setItem('SAFE_v2__AB_human-readable', true))
    main.acceptCookies()
  })

  it('Verify transaction can be expanded/collapsed', () => {
    createTx.clickOnTransactionItem(0)
    createTx.verifyTransactionActionsVisibility('be.visible')
    createTx.clickOnTransactionItem(0)
    createTx.verifyTransactionActionsVisibility('not.be.visible')
  })
})
