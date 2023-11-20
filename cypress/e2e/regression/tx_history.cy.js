import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as createTx from '../pages/create_tx.pages'

const OUTGOING = 'Sent'

const str1 = 'Received'
const str2 = 'Executed'
const str3 = 'Transaction hash'

describe('Transaction history tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    // Go to the test Safe transaction history
    cy.visit(constants.transactionsHistoryUrl + constants.SEPOLIA_TEST_SAFE_5)

    // So that tests that rely on this feature don't randomly fail
    cy.window().then((win) => win.localStorage.setItem('SAFE_v2__AB_human-readable', true))

    main.acceptCookies()
  })

  it('Verify transaction can be expanded/collapsed', () => {
    createTx.clickOnTransactionExpandableItem('Oct 20, 2023', () => {
      createTx.verifyTransactionStrExists(str1)
      createTx.verifyTransactionStrExists(str2)
      createTx.verifyTransactionStrExists(str3)
      createTx.clickOnExpandIcon()
    })
  })
})
