export enum RegistrationType {
  BLOCK,
  SLIDE,
  TISSUE_SAMPLE
}
export function shouldBehaveLikeARegistrationForm(registrationType: RegistrationType) {
  describe('Validation', () => {
    it('requires Donor ID', () => {
      cy.findByLabelText('Donor ID').focus().blur();
      cy.findByText('Donor ID is a required field').should('be.visible');
    });

    context('when Donor ID has contiguous spaces', () => {
      before(() => cy.findByLabelText('Donor ID').type('DONOR  1').blur());

      it('shows a warning', () => {
        cy.findByText(
          'Donor ID contains invalid characters. Only letters, numbers, spaces, hyphens, slashes, backslashes, commas, colons, semicolons, full stops and underscores are permitted.'
        );
      });
    });

    context('when Donor ID has forbidden characters', () => {
      before(() => {
        cy.findByLabelText('Donor ID').clear().blur();
        cy.findByLabelText('Donor ID').clear().type('$DONOR1').blur();
      });

      it('shows a warning', () => {
        cy.findByText(
          'Donor ID contains invalid characters. Only letters, numbers, spaces, hyphens, slashes, backslashes, commas, colons, semicolons, full stops and underscores are permitted.'
        ).should('be.visible');
      });
    });

    context('when Donor ID contains single spaces', () => {
      before(() => {
        cy.findByLabelText('Donor ID').clear().blur();
        cy.findByLabelText('Donor ID').type('Donor 1 Is Fine').blur();
      });

      it('does not show a warning', () => {
        cy.findByText(
          'Donor ID contains invalid characters. Only letters, numbers, spaces, hyphens, and underscores are permitted'
        ).should('not.exist');
      });
    });

    it('requires Species', () => {
      cy.findByLabelText('Species').focus().blur();
      cy.findByText('Species is a required field').should('be.visible');
    });

    it('requires Tissue Type', () => {
      cy.findByLabelText('Tissue Type').focus().blur();
      cy.findByText('Tissue Type is a required field').should('be.visible');
    });

    it(
      registrationType === RegistrationType.TISSUE_SAMPLE
        ? "doesn't require Replicate Number"
        : 'requires Replicate Number',
      () => {
        cy.findByTestId('Replicate Number').clear().blur();
        cy.findByText('Replicate Number is a required field').should(
          registrationType === RegistrationType.TISSUE_SAMPLE ? 'not.exist' : 'be.visible'
        );
      }
    );

    it('requires Biological Risk Assessment Numbers ', () => {
      cy.findByLabelText('Biological Risk Assessment Numbers').focus().blur();
      cy.findByText('Biological Risk Assessment Numbers is a required field').should('be.visible');
    });

    it('requires Replicate Number to be suitable', () => {
      cy.findByTestId('Replicate Number').type('1+1').blur();
      checkReplicateWarningIsVisible();

      cy.findByTestId('Replicate Number').clear().type('1ab!').blur();
      checkReplicateWarningIsVisible();

      cy.findByTestId('Replicate Number').clear().type('1ab67896df.').blur();
      checkReplicateWarningIsVisible();

      cy.findByTestId('Replicate Number').clear().type('1ab678A').blur();
      cy.findByText(
        'Replicate number must be a string of letters and numbers, with isolated hyphens, underscores or full stops.'
      ).should('not.exist');
    });

    it('requires Fixative', () => {
      cy.findByLabelText('Fixative').focus().blur();
      cy.findByText('Fixative is a required field').should('be.visible');
    });

    if (registrationType !== RegistrationType.TISSUE_SAMPLE) {
      it('requires Medium', () => {
        cy.findByLabelText('Medium').focus().blur();
        cy.findByText('Medium is a required field').should('be.visible');
      });
    } else {
      it('requires Solution', () => {
        cy.findByLabelText('Solution').focus().blur();
        cy.findByText('Solution is a required field').should('be.visible');
      });
    }
    if (registrationType === RegistrationType.SLIDE) {
      it('should display Region field', () => {
        cy.findByLabelText('Section position in slot - for multiple sections in a slot').should('be.visible');
      });
    }
  });
  const checkReplicateWarningIsVisible = () => {
    cy.findByText(
      'Replicate number must be a string of letters and numbers, with isolated hyphens, underscores or full stops.'
    ).should('be.visible');
  };
}
