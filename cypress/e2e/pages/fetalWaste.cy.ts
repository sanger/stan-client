import { shouldDisplyProjectAndUserNameForWorkNumber } from '../shared/workNumberExtraInfo.cy';

describe('Fetal Waste Page', () => {
  shouldDisplyProjectAndUserNameForWorkNumber('/lab/fetal_waste', 'workNumber');
  describe('Validation', () => {
    context('when submitting the form with nothing filled in', () => {
      before(() => {
        cy.findByRole('button', { name: 'Submit' }).click();
      });

      it('shows a validation error for labware', () => {
        cy.findByText('Labware field must have at least 1 items').should('be.visible');
      });

      it('shows a validation error for the work number', () => {
        cy.findByText('SGP Number is a required field').should('be.visible');
      });
    });
  });
});
