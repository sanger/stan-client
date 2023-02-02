//Get the dropdown with the given test id
export const getSelect = (dataTestId?: string) => {
  const wrapperDiv = cy.findByTestId(dataTestId ?? 'select-div');
  let select = undefined;
  wrapperDiv.within(() => {
    select = cy.findByRole('combobox');
  });
  return select;
};

//Choose the given option in select box list
const chooseOptionFromSelectList = (optionText: string) => {
  //If given option is empty
  if (optionText.length <= 0) {
    cy.findByRole('combobox').click();
    cy.get('[id$=-option-0]').click({ multiple: true, force: true });
    return;
  }
  cy.findByRole('combobox').first().type(`${optionText}`);
  cy.findByText(optionText).click();
};

//Select the option in dropdown with given test id
export const selectOption = (dataTestId: string, optionText: string) => {
  const wrapperDiv = cy.findByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  if (!wrapperDiv) return;
  wrapperDiv.within(() => {
    chooseOptionFromSelectList(optionText);
  });
};

//Select option if there are multiple dropdowns with same testid
export const selectOptionForMultiple = (dataTestId: string, optionText: string, index?: number) => {
  const wrapperDiv = cy.findAllByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  if (!wrapperDiv) return;
  if (index) {
    wrapperDiv.eq(index).within(() => {
      chooseOptionFromSelectList(optionText);
    });
  } else {
    wrapperDiv.each(($elem) => {
      cy.wrap($elem).within(() => {
        chooseOptionFromSelectList(optionText);
      });
    });
  }
};

//Check whether the dropdown displays the given value
export const shouldDisplaySelectedValue = (dataTestId: string, value: string) => {
  const wrapperDiv = cy.findAllByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  if (!wrapperDiv) return;
  wrapperDiv.each(($elem) => {
    cy.wrap($elem).within(() => {
      cy.contains(value).should('be.visible');
    });
  });
};

//Select SGP NUMBER
export const selectSGPNumber = (workNumber: string) => {
  selectOption('workNumber', workNumber);
};

export const shouldOptionsHaveLength = (dataTestId: string, length: number) => {
  const wrapperDiv = cy.findAllByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  if (!wrapperDiv) return;
  wrapperDiv.within(() => {
    cy.findByRole('combobox').click();
    cy.get('[id*=-option]').should('have.length', length);
  });
};

export const shouldOptionsHaveLengthAbove = (dataTestId: string, length: number) => {
  const wrapperDiv = cy.findAllByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  if (!wrapperDiv) return;
  wrapperDiv.within(() => {
    cy.findByRole('combobox').click();
    cy.get('[id*=-option]').should('have.length.above', length);
  });
};

//Get the dropdown with the given test id
export const selectFocusBlur = (dataTestId?: string) => {
  const wrapperDiv = cy.findByTestId(dataTestId ?? 'select-div');
  if (!wrapperDiv) return;
  wrapperDiv.within(() => {
    cy.findByRole('combobox').focus().blur();
  });
};
