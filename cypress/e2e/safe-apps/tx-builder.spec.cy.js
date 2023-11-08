import 'cypress-file-upload'
import * as constants from '../../support/constants'
import * as main from '../pages/main.page'
import * as safeapps from '../pages/safeapps.pages'

describe('Tx-builder Safe App tests', { defaultCommandTimeout: 20000 }, () => {
  const appUrl = constants.TX_Builder_url
  const iframeSelector = `iframe[id="iframe-${appUrl}"]`
  const visitUrl = `/apps/open?safe=${constants.GOERLI_SAFE_APPS_SAFE}&appUrl=${encodeURIComponent(appUrl)}`
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(visitUrl)
    main.acceptCookies(1)
    safeapps.clickOnContinueBtn()
  })

  it('Verify a simple batch can be created [C56609]', () => {
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

  it('Verify a complex batch can be created [C56610]', () => {
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

  it('Verify a batch can be created using ENS name [C56611]', () => {
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

  it('Verify a batch can be created from an ABI [C56612]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterABIStr).type(safeapps.abi)
      getBody().findByLabelText(safeapps.toAddressStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findByLabelText(safeapps.gorValue).type('0')
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findByText(safeapps.createBatchStr).click()
      getBody().findByText(safeapps.sendBatchStr).click()
    })
    cy.get('h4').contains(safeapps.transactionBuilderStr).should('be.visible')
    cy.findByText(constants.SAFE_APP_ADDRESS_2).should('be.visible')
  })

  it('Verify a batch with custom data can be created [C56613]', () => {
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

  it('Verify a batch can be cancelled [C56614]', () => {
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

  it('Verify cancel operation can be reverted [C56615]', () => {
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

  it('Verify it is allowed to go back without removing data and add more transactions to the batch [C56616]', () => {
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
    cy.get('p').contains('1').should('exist')
    cy.get('p').contains('2').should('exist')
  })

  it('Verify a batch cannot be created with invalid address [C56617]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS_3)
      getBody().findAllByText(safeapps.addressNotValidStr).should('have.css', 'color', 'rgb(244, 67, 54)')
    })
  })

  it('Verify a batch cannot be created without asset amount [C56618]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS_3)
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findAllByText(safeapps.requiredStr).should('have.css', 'color', 'rgb(244, 67, 54)')
    })
  })

  it('Verify a batch cannot be created without method data [C56619]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findByLabelText(safeapps.enterAddressStr).type(constants.SAFE_APP_ADDRESS_2)
      getBody().findByText(safeapps.addTransactionStr).click()
      getBody().findAllByText(safeapps.requiredStr).should('have.css', 'color', 'rgb(244, 67, 54)')
    })
  })

  it('Verify a batch can be uploaded, saved, downloaded and removed [C56620]', () => {
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

  it('Verify there is notification if uploaded batch is from a different chain [C56621]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findAllByText('choose a file').attachFile('test-mainnet-batch.json', { subjectType: 'drag-n-drop' })
      getBody().findAllByText(safeapps.warningStr).should('be.visible')
      getBody().findAllByText(safeapps.anotherChainStr).should('be.visible')
    })
  })

  it('Verify there is error message when a modified batch is uploaded [C56622]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody().findAllByText('choose a file').attachFile('test-modified-batch.json', { subjectType: 'drag-n-drop' })
      getBody().findAllByText(safeapps.changedPropertiesStr)
      getBody().findAllByText('choose a file').should('be.visible')
    })
  })

  it('Verify an invalid batch cannot be uploaded [C56623]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody()
        .findAllByText('choose a file')
        .attachFile('test-invalid-batch.json', { subjectType: 'drag-n-drop' })
        .findAllByText('choose a file')
        .should('be.visible')
    })
  })

  it('Verify an empty batch cannot be uploaded [C56624]', () => {
    cy.enter(iframeSelector).then((getBody) => {
      getBody()
        .findAllByText('choose a file')
        .attachFile('test-empty-batch.json', { subjectType: 'drag-n-drop' })
        .findAllByText('choose a file')
        .should('be.visible')
    })
  })

  it('Verify a valid batch as successful can be simulated [C56625]', () => {
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

  it('Verify an invalid batch as failed can be simulated [C56626]', () => {
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
