import 'cypress-file-upload'
import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'

describe('Tx-builder Safe App tests', { defaultCommandTimeout: 12000 }, () => {
  const appUrl = constants.TX_Builder_url
  const iframeSelector = `iframe[id="iframe-${appUrl}"]`
  const visitUrl = `/apps/open?safe=${constants.GOERLI_SAFE_APPS_SAFE}&appUrl=${encodeURIComponent(appUrl)}`
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(visitUrl)
    main.acceptCookies(1)
    safeapps.clickOnContinueBtn()
  })

  it('should allow to create and send a simple batch', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS)
      getBody().find(safeapps.contractMethodIndex).parent().click()
      getBody().findByRole('option', { name: safeapps.testAddressValue2 }).click()
      getBody().findByLabelText(safeapps.newAddressValueStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByText(safeapps.sendBatchStr).click()
    })
    cy.get('h4').contains(safeapps.transactionBuilderStr).should('be.visible')
    cy.findByRole('button', { name: safeapps.transactionDetailsStr }).click()
    cy.findByRole('region').should('exist')
    cy.findByText(safeapps.testAddressValueStr).should('exist')
    cy.contains(safeapps.newAddressValueStr2).should('exist')
    cy.findAllByText(constants.SAFE_APP_ADDRESS_2_SHORT).should('have.length', 1)
  })

  it('should allow to create and send a complex batch', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS)
      getBody().find(safeapps.contractMethodIndex).parent().click()
      getBody().findByRole('option', { name: safeapps.testBooleanValue }).click()
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().find(safeapps.contractMethodIndex).parent().click()
      getBody().findByRole('option', { name: safeapps.testBooleanValue }).click()
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().find(safeapps.contractMethodIndex).parent().click()
      getBody().findByRole('option', { name: safeapps.testBooleanValue }).click()
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByText(safeapps.sendBatchStr).click()
    })
    cy.findByRole('button', { name: safeapps.testBooleanValue1 }).click()
    cy.findByRole('button', { name: safeapps.testBooleanValue2 }).click()
    cy.findByRole('button', { name: safeapps.testBooleanValue3 }).click()
    cy.findAllByText(safeapps.newValueBool).should('have.length', 3)
    cy.findAllByText('True').should('have.length', 3)
  })

  it('should allow to create and send a batch to an ENS name', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.ENS_TEST_GOERLI)
      getBody().findByRole('button', { name: safeapps.useImplementationABI }).click()
      getBody().findByLabelText(safeapps.ownerAddressStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findByLabelText(safeapps.thresholdStr).type('1')
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByText(safeapps.sendBatchStr).click()
    })
    cy.findByRole('button', { name: safeapps.transactionDetailsStr }).click()
    cy.findByRole('region').should('exist')
    cy.findByText(safeapps.addOwnerWithThreshold).should('exist')
    cy.contains(safeapps.ownerAddressStr2).should('exist')
    cy.findAllByText(constants.SAFE_APP_ADDRESS_2_SHORT).should('have.length', 1)
    cy.findByText(safeapps.thresholdStr2).should('exist')
  })

  it('should allow to a create and send a batch from an ABI', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody()
        .findByLabelText(safeapps.enterABIStr)
        .type(
          '[{{}"inputs":[{{}"internalType":"address","name":"_singleton","type":"address"{}}],"stateMutability":"nonpayable","type":"constructor"{}},{{}"stateMutability":"payable","type":"fallback"{}}]',
        )
      getBody().findByLabelText(safeapps.toAddressStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findByLabelText(safeapps.gorValue).type('0')
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByText(safeapps.sendBatchStr).click()
    })
    cy.findByRole('heading', { name: /transaction builder/i }).should('be.visible')
    cy.findByText(constants.SAFE_APP_ADDRESS_2).should('be.visible')
  })

  it('should allow to create and send a batch using custom data', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().find('.MuiSwitch-root').click()
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS_3)
      getBody().findByLabelText(safeapps.gorValue).type('0')
      getBody().findByLabelText(safeapps.dataStr).type('0x')
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByText(safeapps.sendBatchStr).click()
    })
    cy.get('h4').contains(safeapps.transactionBuilderStr).should('be.visible')
    cy.findByText(constants.SAFE_APP_ADDRESS_3).should('be.visible')
  })

  it('should allow to cancel a created batch', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS)
      getBody().find(safeapps.contractMethodIndex).parent().click()
      getBody().findByRole('option', { name: safeapps.testAddressValue2 }).click()
      getBody().findByLabelText(safeapps.newAddressValueStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByRole('button', { name: safeapps.cancelBtnStr }).click()
      getBody().findByText(safeapps.clearTransactionListStr)
      getBody().findByRole('button', { name: safeapps.confirmClearTransactionListStr }).click()
      getBody().findAllByText('choose a file').should('be.visible')
    })
  })

  it('should allow to revert a cancel and continue with the flow', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS)
      getBody().find(safeapps.contractMethodIndex).parent().click()
      getBody().findByRole('option', { name: safeapps.testAddressValue2 }).click()
      getBody().findByLabelText(safeapps.newAddressValueStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByRole('button', { name: safeapps.cancelBtnStr }).click()
      getBody().findByText(safeapps.clearTransactionListStr)
      getBody().findByRole('button', { name: safeapps.backBtnStr }).click()
      getBody().findByText(safeapps.reviewAndConfirmStr).should('be.visible')
    })
  })

  it('should allow to go back without removing data and add more transactions to the batch', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS)
      getBody().find(safeapps.contractMethodIndex).parent().click()
      getBody().findByRole('option', { name: safeapps.testAddressValue2 }).click()
      getBody().findByLabelText(safeapps.newAddressValueStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByText(safeapps.backToTransactionStr).click()
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS)
      getBody().find(safeapps.contractMethodIndex).parent().click()
      getBody().findByRole('option', { name: safeapps.testAddressValue2 }).click()
      getBody().findByLabelText(safeapps.newAddressValueStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByText(safeapps.sendBatchStr).click()
    })
    cy.get('p').contains('1').should('be.visible')
    cy.get('p').contains('2').should('be.visible')
  })

  it('should not allow to create a batch given invalid address', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS_3)
      getBody().findAllByText(safeapps.addressNotValidStr).should('have.css', 'color', 'rgb(244, 67, 54)')
    })
  })

  it('should not allow to create a batch given no asset amount', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS_3)
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findAllByText(safeapps.requiredStr).should('have.css', 'color', 'rgb(244, 67, 54)')
    })
  })

  it('should not allow to create a batch given no method data', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findAllByText(safeapps.requiredStr).should('have.css', 'color', 'rgb(244, 67, 54)')
    })
  })

  it('should allow to upload a batch, save it to the library, download it & remove it', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findAllByText('choose a file').attachFile('test-working-batch.json', { subjectType: 'drag-n-drop' })
      getBody().findAllByText('uploaded').wait(300)
      getBody().find(safeapps.saveToLibraryBtn).click()
      getBody().findByLabelText(safeapps.batchNameStr).type(safeapps.e3eTestStr)
      getBody().findAllByText(safeapps.createBtnStr).should('not.be.disabled').click()
      getBody().findByText(safeapps.transactionLibraryStr).click()
      getBody().find(safeapps.downloadBatchBtn).click()
      getBody().find(safeapps.deleteBatchBtn).click()
      getBody().findAllByText(safeapps.confirmDeleteBtnStr).should('not.be.disabled').click()
      getBody().findByText(safeapps.noSavedBatchesStr).should('be.visible')
      getBody().findByText(safeapps.backToTransactionStr).should('be.visible')
    })
    cy.readFile('cypress/downloads/E2E test.json').should('exist')
  })

  it('should notify when the uploaded batch is from a different chain', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findAllByText('choose a file').attachFile('test-mainnet-batch.json', { subjectType: 'drag-n-drop' })
      getBody().findAllByText(safeapps.warningStr).should('be.visible')
      getBody().findAllByText(safeapps.anotherChainStr).should('be.visible')
    })
  })

  it('should show an error when a modified batch is uploaded', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findAllByText('choose a file').attachFile('test-modified-batch.json', { subjectType: 'drag-n-drop' })
      getBody().findAllByText(safeapps.changedPropertiesStr)
      getBody().findAllByText('choose a file').should('be.visible')
    })
  })

  it('should not allow to upload an invalid batch', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody()
        .findAllByText('choose a file')
        .attachFile('test-invalid-batch.json', { subjectType: 'drag-n-drop' })
        .findAllByText('choose a file')
        .should('be.visible')
    })
  })

  it('should not allow to upload an empty batch', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody()
        .findAllByText('choose a file')
        .attachFile('test-empty-batch.json', { subjectType: 'drag-n-drop' })
        .findAllByText('choose a file')
        .should('be.visible')
    })
  })

  it('should simulate a valid batch as successful', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS_3)
      getBody().findByLabelText(safeapps.gorValue).type('0')
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByText(safeapps.simulateBtnStr).click()
      getBody().findByText(safeapps.transferStr).should('be.visible')
      getBody().findByText(safeapps.successStr).should('be.visible')
    })
  })

  it('should simulate an invalid batch as failed', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.TEST_SAFE_2)
      getBody().findByText(safeapps.keepProxiABIStr).click()
      getBody().findByLabelText(safeapps.gorValue).type('100')
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByText(safeapps.simulateBtnStr).click()
      getBody().findByText(safeapps.failedStr).should('be.visible')
    })
  })
})
