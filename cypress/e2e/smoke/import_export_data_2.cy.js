import 'cypress-file-upload'
import * as file from '../pages/import_export.pages.js'
import * as main from '../pages/main.page.js'
import * as constants from '../../support/constants.js'
import * as sidebar from '../pages/sidebar.pages.js'

const validJsonPath = 'cypress/fixtures/data_import.json'
const invalidJsonPath = 'cypress/fixtures/address_book_test.csv'
const invalidJsonPath_2 = 'cypress/fixtures/balances.json'
const invalidJsonPath_3 = 'cypress/fixtures/test-empty-batch.json'

const appNames = ['Transaction Builder']

describe('[SMOKE] Import Export Data tests 2', () => {
  beforeEach(() => {
    cy.visit(constants.BALANCE_URL + constants.SEPOLIA_TEST_SAFE_22_IMPORT)
    cy.clearLocalStorage()
    main.acceptCookies()
  })

  it('[SMOKE] Verify that the Sidebar Import button opens an import modal', () => {
    sidebar.openSidebar()
    sidebar.clickOnSidebarImportBtn()
  })

  it('[SMOKE] Verify that correctly formatted json file can be uploaded and shows data', () => {
    sidebar.openSidebar()
    sidebar.clickOnSidebarImportBtn()
    file.dragAndDropFile(validJsonPath)
    file.verifyImportMessages()
    file.verifyImportBtnStatus(constants.enabledStates.enabled)
    file.clickOnImportBtn()
    cy.visit(constants.addressBookUrl + constants.SEPOLIA_TEST_SAFE_22_IMPORT)
    file.verifyImportedAddressBookData()
    cy.visit(constants.appsUrlGeneral + constants.SEPOLIA_TEST_SAFE_22_IMPORT)
    file.verifyPinnedApps(appNames)
  })

  it('[SMOKE] Verify that only json files can be imported', () => {
    sidebar.openSidebar()
    sidebar.clickOnSidebarImportBtn()
    file.dragAndDropFile(invalidJsonPath)
    file.verifyErrorOnUpload()
    file.verifyImportBtnStatus(constants.enabledStates.disabled)
  })

  it('[SMOKE] Verify the Import section is on the Global settings', () => {
    cy.visit(constants.dataSettingsUrl + constants.SEPOLIA_TEST_SAFE_22_IMPORT)
    file.verifyImportSectionVisible()
    file.verifyValidImportInputExists()
  })

  it('[SMOKE] Verify that json files with wrong information are rejected', () => {
    sidebar.openSidebar()
    sidebar.clickOnSidebarImportBtn()
    file.dragAndDropFile(invalidJsonPath_3)
    file.verifyUploadErrorMessage(file.importErrorMessages.noImportableData)
    file.clickOnCancelBtn()
    sidebar.clickOnSidebarImportBtn()
    file.dragAndDropFile(invalidJsonPath_2)
    file.verifyUploadErrorMessage(file.importErrorMessages.noImportableData)
    file.clickOnCancelBtn()
  })

  it('[SMOKE] Verify that the Export section is present in the safe settings', () => {
    cy.visit(constants.dataSettingsUrl + constants.SEPOLIA_TEST_SAFE_22_IMPORT)
    file.verifyExportFileSectionIsVisible()
  })
})
