export const modalTitle = '[data-testid="modal-title"]'
export const modal = '[data-testid="modal-view"]'

export const modalTitiles = {
  editEntry: 'Edit entry',
  deleteEntry: 'Delete entry',
  dataImport: 'Data import',
}

export function verifyModalTitle(title) {
  cy.get(modalTitle).should('contain', title)
}
