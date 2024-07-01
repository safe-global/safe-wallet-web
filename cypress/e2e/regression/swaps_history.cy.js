import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as create_tx from '../pages/create_tx.pages.js'
import * as swaps_data from '../../fixtures/swaps_data.json'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

const swapsHistory = swaps_data.type.history
const limitOrder =
  '&id=multisig_0x8f4A19C85b39032A37f7a6dCc65234f966F72551_0x3faf510142c9ade7ac2a701fb697b95f321fd51f5eb9b17e7e534a8abe472b07'
const limitOrderSafe = 'sep:0x8f4A19C85b39032A37f7a6dCc65234f966F72551'

describe('Swaps history tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.transactionsHistoryUrl + staticSafes.SEP_STATIC_SAFE_1)
    main.acceptCookies()
  })

  it('Verify swap selling operation with one action', { defaultCommandTimeout: 30000 }, () => {
    create_tx.clickOnTransactionItemByName('14')
    create_tx.verifyExpandedDetails([
      swapsHistory.sellOrder,
      swapsHistory.sell,
      swapsHistory.oneCOW,
      swapsHistory.forAtLeast,
      swapsHistory.dai,
      swapsHistory.filled,
    ])
  })

  it('Verify "Partially filled" field is displayed in limit order', () => {
    cy.visit(constants.transactionUrl + limitOrderSafe + limitOrder)
    create_tx.verifyExpandedDetails([swapsHistory.partiallyFilled])
  })
})
