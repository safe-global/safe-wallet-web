import * as constants from '../../support/constants'

const newTransactionBtnStr = 'New transaction'
const recepientInput = 'input[name="recipient"]'
const sendTokensBtnStr = 'Send tokens'
const tokenAddressInput = 'input[name="tokenAddress"]'
const amountInput = 'input[name="amount"]'
const nonceInput = 'input[name="nonce"]'
const gasLimitInput = '[name="gasLimit"]'
const rotateLeftIcon = '[data-testid="RotateLeftIcon"]'
const transactionItemExpandable = 'div[id^="transfer"]'

const viewTransactionBtn = 'View transaction'
const transactionDetailsTitle = 'Transaction details'
const QueueLabel = 'needs to be executed first'
const TransactionSummary = 'Send'

const maxAmountBtnStr = 'Max'
const nextBtnStr = 'Next'
const nativeTokenTransferStr = 'Native token transfer'
const yesStr = 'Yes, '
const estimatedFeeStr = 'Estimated fee'
const executeStr = 'Execute'
const transactionsPerHrStr = 'Transactions per hour'
const transactionsPerHr5Of5Str = '5 of 5'
const editBtnStr = 'Edit'
const executionParamsStr = 'Execution parameters'
const noLaterStr = 'No, later'
const signBtnStr = 'Sign'
const expandAllBtnStr = 'Expand all'
const collapseAllBtnStr = 'Collapse all'

export function clickOnNewtransactionBtn() {
  // Assert that "New transaction" button is visible
  cy.contains(newTransactionBtnStr, {
    timeout: 60_000, // `lastWallet` takes a while initialize in CI
  })
    .should('be.visible')
    .and('not.be.disabled')

  // Open the new transaction modal
  cy.contains(newTransactionBtnStr).click()
  cy.contains('h1', newTransactionBtnStr).should('be.visible')
}

export function typeRecipientAddress(address) {
  cy.get(recepientInput).type(address).should('have.value', address)
}
export function clickOnSendTokensBtn() {
  cy.contains(sendTokensBtnStr).click()
}

export function clickOnTokenselectorAndSelectGoerli() {
  cy.get(tokenAddressInput).prev().click()
  cy.get('ul[role="listbox"]').contains(constants.goerliToken).click()
}

export function setMaxAmount() {
  cy.contains(maxAmountBtnStr).click()
}

export function verifyMaxAmount(token, tokenAbbreviation) {
  cy.get(tokenAddressInput)
    .prev()
    .find('p')
    .contains(token)
    .next()
    .then((element) => {
      const maxBalance = element.text().replace(tokenAbbreviation, '').trim()
      cy.get(amountInput).should('have.value', maxBalance)
      console.log(maxBalance)
    })
}

export function setSendValue(value) {
  cy.get(amountInput).clear().type(value)
}

export function clickOnNextBtn() {
  cy.contains(nextBtnStr).click()
}

export function verifySubmitBtnIsEnabled() {
  cy.get('button[type="submit"]').should('not.be.disabled')
}

export function verifyNativeTokenTransfer() {
  cy.contains(nativeTokenTransferStr).should('be.visible')
}

export function changeNonce(value) {
  cy.get(nonceInput).clear().type(value, { force: true }).blur()
}

export function verifyConfirmTransactionData() {
  cy.contains(yesStr).should('exist').click()
  cy.contains(estimatedFeeStr).should('exist')

  // Asserting the sponsored info is present
  cy.contains(executeStr).scrollIntoView().should('be.visible')

  cy.get('span').contains(estimatedFeeStr).next().should('have.css', 'text-decoration-line', 'line-through')
  cy.contains(transactionsPerHrStr)
  cy.contains(transactionsPerHr5Of5Str)
}

export function openExecutionParamsModal() {
  cy.contains(estimatedFeeStr).click()
  cy.contains(editBtnStr).click()
}

export function verifyAndSubmitExecutionParams() {
  cy.contains(executionParamsStr).parents('form').as('Paramsform')

  // Only gaslimit should be editable when the relayer is selected
  const arrayNames = ['Wallet nonce', 'Max priority fee (Gwei)', 'Max fee (Gwei)']
  arrayNames.forEach((element) => {
    cy.get('@Paramsform').find('label').contains(`${element}`).next().find('input').should('be.disabled')
  })

  cy.get('@Paramsform').find(gasLimitInput).clear().type('300000').invoke('prop', 'value').should('equal', '300000')
  cy.get('@Paramsform').find(gasLimitInput).parent('div').find(rotateLeftIcon).click()
  cy.get('@Paramsform').submit()
}

export function clickOnNoLaterOption() {
  // Asserts the execute checkbox is uncheckable (???)
  cy.contains(noLaterStr).click()
}

export function clickOnSignTransactionBtn() {
  cy.contains(signBtnStr).click()
}

export function waitForProposeRequest() {
  cy.intercept('POST', constants.proposeEndpoint).as('ProposeTx')
  cy.wait('@ProposeTx')
}

export function clickViewTransaction() {
  cy.contains(viewTransactionBtn).click()
}

export function verifySingleTxPage() {
  cy.get('h3').contains(transactionDetailsTitle).should('be.visible')
}

export function verifyQueueLabel() {
  cy.contains(QueueLabel).should('be.visible')
}

export function verifyTransactionSummary(sendValue) {
  cy.contains(TransactionSummary + `${sendValue} ${constants.tokenAbbreviation.gor}`).should('exist')
}

export function verifyDateExists(date) {
  cy.contains('div', date).should('exist')
}

export function verifyImageAltTxt(index, text) {
  cy.get('img').eq(index).should('have.attr', 'alt', text).should('be.visible')
}

export function verifyStatus(status) {
  cy.contains('div', status).should('exist')
}

export function verifyTransactionStrExists(str) {
  cy.contains(str).should('exist')
}

export function verifyTransactionStrNotVible(str) {
  cy.contains(str).should('not.be.visible')
}

export function clickOnTransactionExpandableItem(name, actions) {
  cy.contains('div', name)
    .next()
    .click()
    .within(() => {
      actions()
    })
}

export function clickOnExpandAllBtn() {
  cy.contains(expandAllBtnStr).click()
}

export function clickOnCollapseAllBtn() {
  cy.contains(collapseAllBtnStr).click()
}
