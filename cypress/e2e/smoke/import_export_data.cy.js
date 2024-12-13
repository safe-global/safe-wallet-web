import 'cypress-file-upload'
import * as file from '../pages/import_export.pages'
import * as main from '../pages/main.page'
import * as constants from '../../support/constants'
import * as ls from '../../support/localstorage_data.js'
import * as createwallet from '../pages/create_wallet.pages'

describe('[SMOKE] Import Export Data tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit(constants.dataSettingsUrl).then(() => {
      main.acceptCookies()
      createwallet.selectNetwork(constants.networks.sepolia)
    })
  })

  it('[SMOKE] Verify Safe can be accessed after test file upload', () => {
    const safe = constants.SEPOLIA_CSV_ENTRY.name

    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addedSafes, ls.addedSafes.set1).then(() => {
      main
        .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.importedSafe)
        .then(() => {
          cy.visit(constants.welcomeUrl)
          file.clickOnOpenSafeListSidebar()
          file.clickOnImportedSafe(safe)
        })
    })
  })

  it('[SMOKE] Verify address book imported data', () => {
    main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addedSafes, ls.addedSafes.set1).then(() => {
      main
        .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.importedSafe)
        .then(() => {
          cy.visit(constants.addressBookUrl + constants.SEPOLIA_TEST_SAFE_3)
          file.verifyImportedAddressBookData()
        })
    })
  })

  it('[SMOKE] Verify pinned apps', () => {
    const appNames = ['Transaction Builder']

    cy.visit(constants.appsUrlGeneral + constants.SEPOLIA_TEST_SAFE_3).then(() => {
      main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addedSafes, ls.addedSafes.set1).then(() => {
        main
          .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.importedSafe)
          .then(() => {
            main
              .addToLocalStorage(constants.localStorageKeys.SAFE_v2__safeApps, ls.pinnedApps.transactionBuilder)
              .then(() => {
                cy.reload().then(() => {
                  file.verifyPinnedApps(appNames)
                })
              })
          })
      })
    })
  })

  it('[SMOKE] Verify imported data in settings', () => {
    const unchecked = [file.copyAddressStr]
    const checked = [file.darkModeStr]

    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_3).then(() => {
      main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__settings, ls.safeSettings.settings1).then(() => {
        main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__safeApps, ls.pinnedApps.transactionBuilder).then
        main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addedSafes, ls.addedSafes.set1).then(() => {
          main
            .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.importedSafe)
            .then(() => {
              cy.reload()
              file.clickOnAppearenceBtn()
              file.verifyCheckboxes(unchecked)
              file.verifyCheckboxes(checked, true)
            })
        })
      })
    })
  })

  it('[SMOKE] Verify data for export in Data tab', () => {
    cy.visit(constants.setupUrl + constants.SEPOLIA_TEST_SAFE_3).then(() => {
      main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__settings, ls.safeSettings.settings1).then(() => {
        main.addToLocalStorage(constants.localStorageKeys.SAFE_v2__addedSafes, ls.addedSafes.set1).then(() => {
          main
            .addToLocalStorage(constants.localStorageKeys.SAFE_v2__safeApps, ls.pinnedApps.transactionBuilder)
            .then(() => {
              main
                .addToLocalStorage(constants.localStorageKeys.SAFE_v2__addressBook, ls.addressBookData.importedSafe)
                .then(() => {
                  cy.reload()
                  file.clickOnDataTab()
                  file.verifyImportModalData()
                  file.verifyFileDownload()
                })
            })
        })
      })
    })
  })
})
