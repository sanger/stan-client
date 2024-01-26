import { GetAllWorkInfoQuery, GetAllWorkInfoQueryVariables, WorkStatus } from '../../../src/types/sdk';
import { selectOption } from './customReactSelect.cy';
import { HttpResponse } from 'msw';

export function shouldDisplyProjectAndUserNameForWorkNumber(url: string) {
  describe('Check work number selection displays work requester and project names', () => {
    before(() => {
      cy.visit(url);
      cy.msw().then(({ worker, graphql }) => {
        worker.use(
          graphql.query<GetAllWorkInfoQuery, GetAllWorkInfoQueryVariables>('GetAllWorkInfo', () => {
            return HttpResponse.json({
              data: {
                works: [
                  {
                    workNumber: 'SGP1008',
                    workRequester: { username: 'Test user' },
                    status: WorkStatus.Active,
                    project: { name: 'Test project' }
                  }
                ]
              }
            });
          })
        );
        selectOption('workNumber', 'SGP1008');
      });
    });
    it('displays Work requester and Project name  ', () => {
      cy.findByText('Test project').should('be.visible');
      cy.findByText('Test user').should('be.visible');
    });
    after(() => {
      cy.url().reload();
    });
  });
}
