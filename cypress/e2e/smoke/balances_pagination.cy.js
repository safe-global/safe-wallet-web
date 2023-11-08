import * as constants from '../../support/constants'
import * as balances from '../pages/balances.pages'
import * as main from '../../e2e/pages/main.page'

const ASSETS_LENGTH = 8

describe('Balance tests', () => {
  before(() => {
    cy.clearLocalStorage()
    // Open the Safe used for testing
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_6)
    main.acceptCookies(2)

    balances.selectTokenList(balances.tokenListOptions.allTokens)
  })

  it('Verify a user can change rows per page and navigate to next and previous page [C56073]', () => {
    balances.verifyInitialTableState()
    balances.changeTo10RowsPerPage()
    balances.verifyTableHas10Rows()
    balances.navigateToNextPage()
    balances.verifyTableHasNRows(ASSETS_LENGTH)
    balances.navigateToPreviousPage()
    balances.verifyTableHas10RowsAgain()
  })
})
