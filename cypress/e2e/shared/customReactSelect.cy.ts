/**Utility functions to test react-select component using cypress**/

/**Get the dropdown with the given test id**/
export const getSelect = (dataTestId?: string) => {
  const wrapperDiv = cy.findByTestId(dataTestId ?? 'select-div');
  let select = undefined;
  wrapperDiv.within(() => {
    select = cy.findByRole('combobox');
  });
  return select;
};

/**Get all dropdown components with the given data-testid**/
export const getAllSelect = (dataTestId?: string) => {
  const wrapperDiv = cy.findAllByTestId(dataTestId ?? 'select-div');
  let selectArr: any = [];
  wrapperDiv.each((divElem) => {
    cy.wrap(divElem).within(() => {
      selectArr.push(cy.findByRole('combobox'));
    });
  });
  return selectArr;
};
/**Choose the given option from drordowbn box **/
const chooseOptionFromSelectList = (optionText: string) => {
  //If given option is empty
  if (optionText.length <= 0) {
    cy.findByRole('combobox').should('exist').click({ force: true });
    cy.get('[id$=-option-0]').click({ multiple: true, force: true });
    return;
  }
  cy.findByRole('combobox').first().type(`${optionText}`, { force: true });
  cy.findByText(optionText).should('exist').click({ force: true });
};

/**Select the option in dropdown with given test id**/
export const selectOption = (dataTestId: string, optionText: string) => {
  const wrapperDiv = cy.findByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  wrapperDiv.within(() => {
    chooseOptionFromSelectList(optionText);
  });
};

/**Select option if there are multiple dropdowns with same testid. If index is given ,
 * it will only select option for dropdown in given index, otherwise for all**/
export const selectOptionForMultiple = (dataTestId: string, optionText: string, index?: number) => {
  const wrapperDiv = cy.findAllByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  if (index !== undefined) {
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

/**Remove all selections, work only for a multi-select dropdown**/
export const removeSelections = (dataTestId: string) => {
  const wrapperDiv = cy.findByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  wrapperDiv.within(() => {
    cy.get('[aria-label^=Remove]').each(($elem) => {
      cy.wrap($elem).click({ force: true });
    });
  });
};

/**Check whether the dropdown with given data-testid has the given option**/
export const shouldHaveOption = (dataTestId: string, option: string) => {
  const wrapperDiv = cy.findAllByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  wrapperDiv.within(() => {
    cy.findByRole('combobox').should('exist').click({ force: true });
    cy.contains(option).should('be.visible');
  });
};

/**Check whether the dropdown is disabled**/
export const shouldBeDisabled = (dataTestId: string) => {
  const wrapperDiv = cy.findByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  wrapperDiv.within(() => {
    cy.get('input[type="text"]').should('exist').should('have.prop', 'disabled', true);
  });
};

/**Check whether the dropdown displays the given value**/
export const shouldDisplaySelectedValue = (dataTestId: string, value: string, index?: number) => {
  if (!value) return;
  const wrapperDiv = cy.findAllByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  if (index) {
    wrapperDiv.eq(index).within(() => {
      cy.contains(value).should('be.visible');
    });
  } else {
    wrapperDiv.each(($elem) => {
      cy.wrap($elem).within(() => {
        cy.contains(value).should('be.visible');
      });
    });
  }
};

/**Check whether the drodown displays an empty value**/
export const shouldDisplayEmptyValue = (dataTestId: string) => {
  const wrapperDiv = cy.findByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  wrapperDiv.within(() => {
    cy.findByRole('combobox').should('exist').should('have.value', '');
  });
};

/**Select given SGP NUMBER**/
export const selectSGPNumber = (workNumber: string) => {
  selectOption('workNumber', workNumber);
};

export const shouldOptionsHaveLength = (dataTestId: string, length: number) => {
  const wrapperDiv = cy.findAllByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  wrapperDiv.within(() => {
    cy.findByRole('combobox').should('exist').click({ force: true });
    cy.get('[id*=-option]').should('exist').should('have.length', length);
  });
};

export const shouldOptionsHaveLengthAbove = (dataTestId: string, length: number) => {
  const wrapperDiv = cy.findAllByTestId(dataTestId.length > 0 ? dataTestId : 'select-div');
  wrapperDiv.within(() => {
    cy.findByRole('combobox').should('exist').click({ force: true });
    cy.get('[id*=-option]').should('have.length.above', length);
  });
};

//Get the dropdown with the given test id
export const selectFocusBlur = (dataTestId?: string, index?: number) => {
  const wrapperDiv = cy.findAllByTestId(dataTestId ?? 'select-div');
  const indxVal = index ?? 0;
  wrapperDiv.eq(indxVal).within(() => {
    cy.findByRole('combobox').should('exist').focus().blur();
  });
};
