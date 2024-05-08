import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as createTx from '../pages/create_tx.pages.js'
import * as msg_data from '../../fixtures/txmessages_data.json'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'

let staticSafes = []

const typeMessagesGeneral = msg_data.type.general
const typeMessagesOffchain = msg_data.type.offChain

describe('Offchain Messages tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.transactionsMessagesUrl + staticSafes.SEP_STATIC_SAFE_10)
    main.acceptCookies()
  })

  it('Verify summary for off-chain unsigned messages', () => {
    createTx.verifySummaryByIndex(
      0,
      [typeMessagesGeneral.sign, typeMessagesGeneral.oneOftwo, typeMessagesOffchain.walletConnect],
      typeMessagesOffchain.altTmage,
    )
    createTx.verifySummaryByIndex(
      2,
      [typeMessagesGeneral.sign, typeMessagesGeneral.oneOftwo, typeMessagesOffchain.walletConnect],
      typeMessagesOffchain.altTmage,
    )
  })

  it('Verify summary for off-chain signed messages', () => {
    createTx.verifySummaryByIndex(
      1,
      [typeMessagesGeneral.confirmed, typeMessagesGeneral.twoOftwo, typeMessagesOffchain.walletConnect],
      typeMessagesOffchain.altTmage,
    )
    createTx.verifySummaryByIndex(
      3,
      [typeMessagesGeneral.confirmed, typeMessagesGeneral.twoOftwo, typeMessagesOffchain.walletConnect],
      typeMessagesOffchain.altTmage,
    )
  })

  it('Verify exapanded details for simple off-chain message', () => {
    createTx.clickOnTransactionItemByIndex(2)
    cy.contains(typeMessagesOffchain.message2).should('be.visible')
  })

  it('Verify exapanded details for EIP 712 off-chain message', () => {
    const jsonString = createTx.messageNestedStr
    const values = [
      typeMessagesOffchain.name,
      typeMessagesOffchain.testStringNested,
      typeMessagesOffchain.EIP712Domain,
      typeMessagesOffchain.message3,
    ]

    createTx.clickOnTransactionItemByIndex(1)
    cy.get(createTx.txRowTitle)
      .next()
      .then(($section) => {
        expect($section.text()).to.include(jsonString)
        const count = $section.text().split(jsonString).length - 1
        expect(count).to.eq(3)
      })

    main.verifyTextVisibility(values)
  })
})
