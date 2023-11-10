import 'cypress-file-upload'
import * as file from '../pages/import_export.pages'
import * as main from '../pages/main.page'
import * as constants from '../../support/constants'

describe('Import Export Data tests', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.dataSettingsUrl)
    main.acceptCookies()
  })

  it('Verify Safe can be accessed after test file upload', () => {
    const filePath = '../fixtures/data_import.json'
    const safe = constants.SEPOLIA_CSV_ENTRY.name

    file.uploadFile(filePath)
    file.verifyImportModalData()
    file.clickOnImportBtnDataImportModal()
    cy.visit(constants.welcomeUrl)
    file.clickOnOpenSafeListSidebar()
    file.clickOnImportedSafe(safe)
    file.clickOnClosePushNotificationsBanner()
  })

  it('Verify address book imported data', () => {
    main.acceptCookies()
    file.clickOnAddressBookBtn()
    file.verifyImportedAddressBookData()
  })

  it('Verify pinned apps', () => {
    const appNames = ['Transaction Builder']

    file.clickOnAppsBtn()
    file.verifyAppsAreVisible(appNames)
  })

  it('Verify imported data in settings', () => {
    const unchecked = [file.prependChainPrefixStr, file.copyAddressStr]
    const checked = [file.darkModeStr]
    file.clickOnSettingsBtn()
    file.clickOnAppearenceBtn()
    file.verifyCheckboxes(unchecked)
    file.verifyCheckboxes(checked, true)
  })

  it('Verifies data for export in Data tab', () => {
    file.clickOnShowMoreTabsBtn()
    file.verifDataTabBtnIsVisible()
    file.clickOnDataTab()
    file.verifyImportModalData()
    file.verifyFileDownload()
  })
})
