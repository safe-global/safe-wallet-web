import 'cypress-file-upload'
import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'

describe('Drain Account Safe App tests', { defaultCommandTimeout: 12000 }, () => {
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

  it('should allow to perform a drain', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findAllByText(safeapps.transferEverythingStr).click()
    })
    cy.findByRole('button', { name: safeapps.testTransfer1 })
    cy.findByRole('button', { name: safeapps.testNativeTransfer2 })
  })

  it('should allow to perform a partial drain', () => {
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

  it('should allow to perform a drain when a ENS is specified', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type('goerli-test-safe.eth').wait(2000)
      getBody().findAllByText(safeapps.transferEverythingStr).click()
    })
    cy.findByRole('button', { name: safeapps.testTransfer1 })
    cy.findByRole('button', { name: safeapps.testNativeTransfer2 })
  })

  // Adjust safe - owner
  it.skip('should keep previous data when drain is cancelled', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findAllByText(safeapps.transferEverythingStr).click()
    })
    cy.findByRole('button', { name: 'Cancel' }).click()
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findAllByText(safeapps.transferEverythingStr).should('be.visible')
    })
  })

  it('should not allow to perform a drain when no recipient is selected', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findAllByText(safeapps.transferEverythingStr).click()
      getBody().findByText(safeapps.validRecipientAddressStr)
    })
  })

  it('should not allow to perform a drain when an invalid recipient is selected', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type('0x49d4450977E2c95362C13D3a31a09311E0Ea26A')
      getBody().findAllByText(safeapps.transferEverythingStr).click()
      getBody().findByText(safeapps.validRecipientAddressStr)
    })
  })

  it('should not allow to perform a drain when no assets are selected', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.selectAllRowsChbxStr).click()
      getBody().findByLabelText(safeapps.recipientStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findAllByText('No tokens selected').should('be.visible')
    })
  })

  it('should not allow to perform a drain when no assets and recipient are selected', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.selectAllRowsChbxStr).click()
      getBody().findAllByText('No tokens selected').should('be.visible')
    })
  })
})
