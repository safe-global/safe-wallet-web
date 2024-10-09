import * as main from '../pages/main.page.js'
import * as createTx from '../pages/create_tx.pages.js'
import * as constants from '../../support/constants.js'

const safe = 'sep:0x2a73e61bd15b25B6958b4DA3bfc759ca4db249b9'
const decodedTx =
  '&id=multisig_0x2a73e61bd15b25B6958b4DA3bfc759ca4db249b9_0xa3e73a212d7025c08048a05dcd829a88d1bf8a7c0d9eaf453b3b6039ad6156f3'

//TODO: Check file error
describe('Tx decoding tests', () => {
  it.skip('Check visual tx', () => {
    cy.visit(constants.transactionUrl + safe + decodedTx)
    createTx.clickOnExpandAllActionsBtn()
    cy.wait(1000)
    cy.compareSnapshot('tx_decoding', { errorThreshold: 0, failSilently: false })
  })
})
