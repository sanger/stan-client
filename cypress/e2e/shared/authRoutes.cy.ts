describe('Authorized routes', () => {
  describe('/admin/registration', () => {
    before(() => {
      cy.visitAsGuest('/admin/registration');
    });

    context('when not authenticated', () => {
      it('redirects to the login page', () => {
        cy.location().should((location) => {
          expect(location.pathname).to.eq('/login');
        });
      });

      it('should display a warning', () => {
        cy.findByText('Please sign in to access /admin/registration').should('be.visible');
      });

      it('should redirect to /admin/registration after logging in', () => {
        cy.get("input[name='username']").type('jb1');
        cy.get("input[name='password']").type('supersecret');
        cy.get("button[type='submit']").click();

        cy.location().should((location) => {
          expect(location.pathname).to.eq('/admin/registration');
        });
      });
    });

    context('when authenticated', () => {
      before('I am authenticated', () => {
        cy.visit('/admin/registration');
      });

      it('goes to the /admin/registration page', () => {
        cy.location().should((location) => {
          expect(location.pathname).to.eq('/admin/registration');
        });
      });
    });
  });

  describe('Admin routes', () => {
    context('when visiting as a normal user', () => {
      before(() => {
        cy.visit('/config');
      });

      it('redirects to the homepage', () => {
        cy.location().should((location) => {
          expect(location.pathname).to.eq('/');
        });
      });

      it('shows an error', () => {
        cy.findByText('You are not authorised to access /config').should('be.visible');
      });
    });

    context('when visiting as an admin user', () => {
      before(() => {
        cy.visitAsAdmin('/config');
      });

      it('navigates to the page', () => {
        cy.findByText('STAN Configuration').should('be.visible');
      });
    });
  });
});
