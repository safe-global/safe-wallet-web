import 'cypress-file-upload'
import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'

describe('Drain Account tests', { defaultCommandTimeout: 12000 }, () => {
  const appUrl = constants.drainAccount_url
  const iframeSelector = `iframe[id="iframe-${appUrl}"]`
  const visitUrl = `/apps/open?safe=${constants.GOERLI_SAFE_APPS_SAFE}&appUrl=${encodeURIComponent(appUrl)}`

  beforeEach(() => {
    cy.intercept(`**//v1/chains/5/safes/${constants.GOERLI_SAFE_APPS_SAFE.substring(4)}/balances/**`, {
      fixture: 'balances.json',
    })

    cy.clearLocalStorage()
    cy.visit(visitUrl)
    main.acceptCookies(1)
    safeapps.clickOnContinueBtn()
  })

  it('Verify drain can be created [C56627]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findAllByText(safeapps.transferEverythingStr).click()
    })
    cy.findByRole('button', { name: safeapps.testTransfer1 })
    cy.findByRole('button', { name: safeapps.testNativeTransfer2 })
  })

  it('Verify partial drain can be created [C56628]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.selectAllRowsChbxStr).click()
      getBody().findAllByLabelText(safeapps.selectRowChbxStr).eq(1).click()
      getBody().findAllByLabelText(safeapps.selectRowChbxStr).eq(2).click()
      getBody().findByLabelText(safeapps.recipientStr).clear().type(constants.SAFE_APP_ADDRESS_2)
      getBody().findAllByText(safeapps.transfer2AssetsStr).click()
    })
    cy.findByRole('button', { name: safeapps.testTransfer2 })
    cy.findByRole('button', { name: safeapps.testNativeTransfer1 })
  })

  it('Verify a drain can be created when a ENS is specified [C56629]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type('goerli-test-safe.eth').wait(2000)
      getBody().findAllByText(safeapps.transferEverythingStr).click()
    })
    cy.findByRole('button', { name: safeapps.testTransfer1 })
    cy.findByRole('button', { name: safeapps.testNativeTransfer2 })
  })

  // TODO: Adjust safe - owner
  it.skip('Verify when cancelling a drain, previous data is preserved [C56630]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findAllByText(safeapps.transferEverythingStr).click()
    })
    cy.findByRole('button', { name: safeapps.cancelBtnStr }).click()
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findAllByText(safeapps.transferEverythingStr).should('be.visible')
    })
  })

  it('Verify a drain cannot be created with no recipient selected [C56631]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findAllByText(safeapps.transferEverythingStr).click()
      getBody().findByText(safeapps.validRecipientAddressStr)
    })
  })

  it('Verify a drain cannot be created with invalid recipient selected [C56632]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type(constants.SAFE_APP_ADDRESS_2.substring(1))
      getBody().findAllByText(safeapps.transferEverythingStr).click()
      getBody().findByText(safeapps.validRecipientAddressStr)
    })
  })

  it('Verify a drain cannot be created when no assets are selected [C56633]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.selectAllRowsChbxStr).click()
      getBody().findByLabelText(safeapps.recipientStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findAllByText(safeapps.noTokensSelectedStr).should('be.visible')
    })
  })

  it('should not allow to perform a drain when no assets and recipient are selected', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.selectAllRowsChbxStr).click()
      getBody().findAllByText(safeapps.noTokensSelectedStr).should('be.visible')
    })
  })
})
