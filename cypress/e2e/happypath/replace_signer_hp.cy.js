import * as constants from '../../support/constants'
import * as main from '../../e2e/pages/main.page'
import * as owner from '../pages/owners.pages'
import * as createTx from '../pages/create_tx.pages.js'

const ownerName = 'Replacement Signer Name'

describe('Replace Owners tests', () => {
  beforeEach(() => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_26_REPLACE_OWNER)
    cy.clearLocalStorage()
    main.acceptCookies()
    cy.contains(owner.safeAccountNonceStr, { timeout: 10000 })
  })

  it("Verify 'Replace' tx is created", () => {
    owner.waitForConnectionStatus()
    owner.openReplaceOwnerWindow()
    cy.wait(1000)
    owner.typeOwnerName(ownerName)
    owner.typeOwnerAddress(constants.SEPOLIA_OWNER_2)
    createTx.changeNonce(2)
    owner.clickOnNextBtn()
    createTx.clickOnSignTransactionBtn()
    createTx.waitForProposeRequest()
    createTx.clickViewTransaction()
    createTx.verifyReplacedSigner(ownerName)
  })
})
