import 'cypress-file-upload'
import * as file from '../pages/import_export.pages'
import * as main from '../pages/main.page'
import * as constants from '../../support/constants'

describe('Import Export Data', () => {
  before(() => {
    cy.clearLocalStorage()
    cy.visit(constants.welcomeUrl)
    main.acceptCookies()
    file.verifyImportBtnIsVisible()
  })

  it('Uploads test file and access safe', () => {
    const filePath = '../fixtures/data_import.json'
    const safe = 'safe 1 goerli'

    file.clickOnImportBtn()
    file.uploadFile(filePath)
    file.verifyImportModalData()
    file.clickOnImportBtnDataImportModal()
    file.clickOnImportedSafe(safe)
    file.clickOnClosePushNotificationsBanner()
  })

  it("Verify safe's address book imported data", () => {
    file.clickOnAddressBookBtn()
    file.verifyImportedAddressBookData()
  })

  it('Verify pinned apps', () => {
    const appNames = ['Drain Account', 'Transaction Builder']

    file.clickOnAppsBtn()
    file.clickOnBookmarkedAppsBtn()
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
