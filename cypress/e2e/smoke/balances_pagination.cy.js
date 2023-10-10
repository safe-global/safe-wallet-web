import * as constants from '../../support/constants'
import * as balances from '../pages/balances.pages'

const ASSETS_LENGTH = 8

describe('Balance pagination tests', () => {
  before(() => {
    cy.clearLocalStorage()
    // Open the Safe used for testing
    cy.visit(constants.BALANCE_URL + constants.PAGINATION_TEST_SAFE)
    cy.contains('button', 'Accept selection').click()
    // Table is loaded
    cy.contains('Görli Ether')

    cy.contains('button', 'Got it').click()
    cy.contains('div', 'Default tokens').click()
    cy.wait(100)
    cy.contains('div', 'All tokens').click()
  })

  it('should allow changing rows per page and navigate to next and previous page', () => {
    balances.verifyInitialTableState()
    balances.changeTo10RowsPerPage()
    balances.verifyTableHas10Rows()
    balances.navigateToNextPage()
    balances.verifyTableHasNRows(ASSETS_LENGTH)
    balances.navigateToPreviousPage()
    balances.verifyTableHas10RowsAgain()
  })
})
