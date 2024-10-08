import * as constants from '../../support/constants.js'
import * as main from '../pages/main.page.js'
import * as createTx from '../pages/create_tx.pages.js'
import * as msg_data from '../../fixtures/txmessages_data.json'
import { getSafes, CATEGORIES } from '../../support/safes/safesHandler.js'
import * as modal from '../pages/modals.page'
import * as messages from '../pages/messages.pages.js'
import * as msg_confirmation_modal from '../pages/modals/message_confirmation.pages.js'
import * as wallet from '../../support/utils/wallet.js'

let staticSafes = []
const offchainMessage = 'Test message 2 off-chain'

const typeMessagesGeneral = msg_data.type.general
const typeMessagesOffchain = msg_data.type.offChain

const walletCredentials = JSON.parse(Cypress.env('CYPRESS_WALLET_CREDENTIALS'))
const signer = walletCredentials.OWNER_4_PRIVATE_KEY

describe('[SMOKE] Offchain Messages tests', () => {
  before(async () => {
    staticSafes = await getSafes(CATEGORIES.static)
  })

  beforeEach(() => {
    cy.visit(constants.transactionsMessagesUrl + staticSafes.SEP_STATIC_SAFE_10)
  })

  // TODO: Clarify changes
  it.skip('[SMOKE] Verify summary for off-chain unsigned messages', () => {
    createTx.verifySummaryByIndex(0, [
      typeMessagesGeneral.sign,
      typeMessagesGeneral.oneOftwo,
      typeMessagesOffchain.testMessage1,
    ])
    createTx.verifySummaryByIndex(2, [
      typeMessagesGeneral.sign,
      typeMessagesGeneral.oneOftwo,
      typeMessagesOffchain.testMessage2,
    ])
  })

  // TODO: Clarify changes
  it.skip('[SMOKE] Verify summary for off-chain signed messages', () => {
    createTx.verifySummaryByIndex(1, [
      typeMessagesGeneral.confirmed,
      typeMessagesGeneral.twoOftwo,
      typeMessagesOffchain.name,
    ])
    createTx.verifySummaryByIndex(3, [
      typeMessagesGeneral.confirmed,
      typeMessagesGeneral.twoOftwo,
      typeMessagesOffchain.testMessage3,
    ])
  })

  it('[SMOKE] Verify exapanded details for EIP 191 off-chain message', () => {
    createTx.clickOnTransactionItemByIndex(2)
    cy.contains(typeMessagesOffchain.message2).should('be.visible')
  })

  it('[SMOKE] Verify exapanded details for EIP 712 off-chain message', () => {
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

  // TODO: Clarify changes
  it.skip('[SMOKE] Verify confirmation window is displayed for unsigned message', () => {
    wallet.connectSigner(signer)
    messages.clickOnMessageSignBtn(2)
    msg_confirmation_modal.verifyConfirmationWindowTitle(modal.modalTitiles.confirmMsg)
    msg_confirmation_modal.verifyMessagePresent(offchainMessage)
    msg_confirmation_modal.clickOnMessageDetails()
    msg_confirmation_modal.verifyOffchainMessageHash(0)
    msg_confirmation_modal.verifyOffchainMessageHash(1)
    msg_confirmation_modal.checkMessageInfobox()
  })
})
