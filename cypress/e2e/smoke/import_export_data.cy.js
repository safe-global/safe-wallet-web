import 'cypress-file-upload'
import * as file from '../pages/import_export.pages'
import * as main from '../pages/main.page'
import * as constants from '../../support/constants'

describe('Import Export Data tests', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.welcomeUrl)
    main.acceptCookies()
    file.verifyImportBtnIsVisible()
  })

  it('Verify Safe can be accessed after test file upload [C56111]', () => {
    const filePath = '../fixtures/data_import.json'
    const safe = constants.SEPOLIA_CSV_ENTRY.name

    file.clickOnImportBtn()
    file.uploadFile(filePath)
    file.verifyImportModalData()
    file.clickOnImportBtnDataImportModal()
    file.clickOnImportedSafe(safe)
    file.clickOnClosePushNotificationsBanner()
  })

  it('Verify address book imported data [C56112]', () => {
    main.acceptCookies()
    file.clickOnAddressBookBtn()
    file.verifyImportedAddressBookData()
  })

  it('Verify pinned apps [C56113]', () => {
    const appNames = ['Transaction Builder']

    file.clickOnAppsBtn()
    file.verifyAppsAreVisible(appNames)
  })

  it('Verify imported data in settings [C56114]', () => {
    const unchecked = [file.prependChainPrefixStr, file.copyAddressStr]
    const checked = [file.darkModeStr]
    file.clickOnSettingsBtn()
    file.clickOnAppearenceBtn()
    file.verifyCheckboxes(unchecked)
    file.verifyCheckboxes(checked, true)
  })

  it('Verifies data for export in Data tab [C56115]', () => {
    file.clickOnShowMoreTabsBtn()
    file.verifDataTabBtnIsVisible()
    file.clickOnDataTab()
    file.verifyImportModalData()
    file.verifyFileDownload()
  })
})
