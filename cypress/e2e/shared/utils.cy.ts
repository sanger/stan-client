export const getSelect = (dataTestId?: string) => {
  const wrapperDiv = cy.findByTestId(dataTestId ?? 'select-div');
  let select = undefined;
  wrapperDiv.within(() => {
    select = cy.findByRole('combobox');
  });
  return select;
};
export const selectOption = (dataTestId: string, optionText: string) => {
  const wrapperDiv = cy.findByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  if (!wrapperDiv) return;
  if (optionText.length <= 0) {
    wrapperDiv.within(() => {
      cy.findByRole('combobox').click();
      cy.get('[id$=-option-0]').click({ multiple: true, force: true });
    });
    return;
  }
  wrapperDiv.within(() => {
    cy.findByRole('combobox').first().type(`${optionText}`);
    cy.findByText(optionText).click();
  });
};
