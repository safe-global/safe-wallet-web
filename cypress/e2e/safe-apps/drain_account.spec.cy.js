import 'cypress-file-upload'
import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'
import * as navigation from '../pages/navigation.page'

describe('Drain Account tests', { defaultCommandTimeout: 12000 }, () => {
  const appUrl = constants.drainAccount_url
  const iframeSelector = `iframe[id="iframe-${appUrl}"]`
  const visitUrl = `/apps/open?safe=${constants.SEPOLIA_TEST_SAFE_9}&appUrl=${encodeURIComponent(appUrl)}`

  beforeEach(() => {
    cy.intercept(`**//v1/chains/11155111/safes/${constants.SEPOLIA_TEST_SAFE_9.substring(4)}/balances/**`, {
      fixture: 'balances.json',
    })

    cy.clearLocalStorage()
    cy.visit(visitUrl)
    main.acceptCookies()
    safeapps.clickOnContinueBtn()
  })

  it('Verify drain can be created', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type(constants.SEPOLIA_TEST_SAFE_10)
      getBody().findAllByText(safeapps.transferEverythingStr).click()
    })
    cy.findByRole('button', { name: safeapps.testTransfer1 })
    cy.findByRole('button', { name: safeapps.nativeTransfer2 })
  })

  it('Verify partial drain can be created', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.selectAllRowsChbxStr).click()
      getBody().findAllByLabelText(safeapps.selectRowChbxStr).eq(1).click()
      getBody().findAllByLabelText(safeapps.selectRowChbxStr).eq(2).click()
      getBody().findByLabelText(safeapps.recipientStr).clear().type(constants.SEPOLIA_TEST_SAFE_10)
      getBody().findAllByText(safeapps.transfer2AssetsStr).click()
    })
    cy.findByRole('button', { name: safeapps.testTransfer2 })
    cy.findByRole('button', { name: safeapps.nativeTransfer1 })
  })

  // TODO: ENS does not resolve
  it.skip('Verify a drain can be created when a ENS is specified', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type(constants.ENS_TEST_SEPOLIA).wait(2000)
      getBody().findAllByText(safeapps.transferEverythingStr).click()
    })
    cy.findByRole('button', { name: safeapps.testTransfer1 })
    cy.findByRole('button', { name: safeapps.nativeTransfer2 })
  })

  it('Verify when cancelling a drain, previous data is preserved', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type(constants.SEPOLIA_TEST_SAFE_10)
      getBody().findAllByText(safeapps.transferEverythingStr).click()
    })
    navigation.clickOnModalCloseBtn()
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findAllByText(safeapps.transferEverythingStr).should('be.visible')
    })
  })

  it('Verify a drain cannot be created with no recipient selected', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findAllByText(safeapps.transferEverythingStr).click()
      getBody().findByText(safeapps.validRecipientAddressStr)
    })
  })

  it('Verify a drain cannot be created with invalid recipient selected', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.recipientStr).type(constants.SEPOLIA_TEST_SAFE_10.substring(1))
      getBody().findAllByText(safeapps.transferEverythingStr).click()
      getBody().findByText(safeapps.validRecipientAddressStr)
    })
  })

  it('Verify a drain cannot be created when no assets are selected', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.selectAllRowsChbxStr).click()
      getBody().findByLabelText(safeapps.recipientStr).type(constants.SEPOLIA_TEST_SAFE_10)
      getBody().findAllByText(safeapps.noTokensSelectedStr).should('be.visible')
    })
  })

  it('Verify a drain cannot be created when no assets and recipient are selected', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.selectAllRowsChbxStr).click()
      getBody().findAllByText(safeapps.noTokensSelectedStr).should('be.visible')
    })
  })
})
