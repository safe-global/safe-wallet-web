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
const expandItemIcon = '[data-testid="ExpandMoreIcon"]'
const connectedWalletExecMethod = '[data-testid="connected-wallet-execution-method"]'
const addToBatchBtn = '[data-track="batching: Add to batch"]'

const viewTransactionBtn = 'View transaction'
const transactionDetailsTitle = 'Transaction details'
const QueueLabel = 'needs to be executed first'
const TransactionSummary = 'Send '

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
  cy.get(recepientInput).clear().type(address).should('have.value', address)
}
export function typeENSName() {
  cy.get(recepientInput).clear().type(constants.ENS_TEST_SEPOLIA).should('have.value', constants.DEFAULT_OWNER_ADDRESS)
}

export function clickOnSendTokensBtn() {
  cy.contains(sendTokensBtnStr).click()
}

export function verifyRandomStringAddress(randomAddressString) {
  typeRecipientAddress(randomAddressString)
  cy.contains(constants.addressBookErrrMsg.invalidFormat).should('be.visible')
}

export function verifyWrongChecksum(wronglyChecksummedAddress) {
  typeRecipientAddress(wronglyChecksummedAddress)
  cy.contains(constants.addressBookErrrMsg.invalidChecksum).should('be.visible')
}

export function verifyAmountNegativeNumber() {
  setSendValue(-1)
  cy.contains(constants.amountErrorMsg.negativeValue).should('be.visible')
}

export function verifyAmountLargerThanCurrentBalance() {
  setSendValue(9999)
  cy.contains(constants.amountErrorMsg.largerThanCurrentBalance).should('be.visible')
}

export function verifyAmountMustBeNumber() {
  setSendValue('abc')
  cy.contains(constants.amountErrorMsg.randomString).should('be.visible')
}

export function verifyTooltipMessage(message) {
  cy.get('div[role="tooltip"]').contains(message).should('be.visible')
}

export function selectCurrentWallet() {
  cy.get(connectedWalletExecMethod).click()
}

export function verifyRelayerAttemptsAvailable() {
  cy.contains(transactionsPerHrStr).should('be.visible')
  cy.contains(transactionsPerHr5Of5Str).should('be.visible')
}

export function clickOnTokenselectorAndSelectSepoliaEth() {
  cy.get(tokenAddressInput).prev().click()
  cy.get('ul[role="listbox"]').contains(constants.tokenNames.sepoliaEther).click()
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
      const maxBalance = parseFloat(element.text().replace(tokenAbbreviation, '').trim())
      cy.get(amountInput).should(($input) => {
        const actualValue = parseFloat($input.val())
        expect(actualValue).to.be.closeTo(maxBalance, 0.1)
      })
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

export function verifyAddToBatchBtnIsEnabled() {
  cy.get(addToBatchBtn).should('not.be.disabled')
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

  cy.get('span').contains(estimatedFeeStr)
}

export function openExecutionParamsModal() {
  cy.contains(estimatedFeeStr).click()
  cy.contains(editBtnStr).click()
}

export function verifyAndSubmitExecutionParams() {
  cy.contains(executionParamsStr).parents('form').as('Paramsform')

  const arrayNames = ['Wallet nonce', 'Max priority fee (Gwei)', 'Max fee (Gwei)', 'Gas limit']
  arrayNames.forEach((element) => {
    cy.get('@Paramsform').find('label').contains(`${element}`).next().find('input').should('not.be.disabled')
  })

  cy.get('@Paramsform').find(gasLimitInput).clear().type('100').invoke('prop', 'value').should('equal', '100')
  cy.contains('Gas limit must be at least 21000').should('be.visible')
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
  cy.contains(TransactionSummary + `${sendValue} ${constants.tokenAbbreviation.sep}`).should('exist')
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

export function clickOnExpandIcon() {
  cy.get(expandItemIcon).click()
}
