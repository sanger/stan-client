import { FindPassFailsQuery, FindPassFailsQueryVariables, PassFail, UserRole } from '../../types/sdk';
import { graphql, HttpResponse } from 'msw';

const passFailHandlers = [
  graphql.query<FindPassFailsQuery, FindPassFailsQueryVariables>('FindPassFails', ({ variables }) => {
    return HttpResponse.json(
      {
        data: {
          passFails: [
            {
              operation: {
                id: 1,
                operationType: {
                  name: 'Slide Processing'
                },
                actions: [],
                user: {
                  username: '',
                  role: UserRole.Normal
                },
                performed: new Date().toISOString()
              },
              slotPassFails: [
                {
                  address: 'A1',
                  result: PassFail.Pass
                },
                {
                  address: 'A2',
                  result: PassFail.Fail,
                  comment: 'Slot damaged'
                },
                {
                  address: 'B1',
                  result: PassFail.Pass
                },
                {
                  address: 'B2',
                  result: PassFail.Fail,
                  comment: 'Invalid sample'
                }
              ]
            }
          ]
        }
      },
      { status: 200 }
    );
    /*ctx.errors([
          { message: `Could not find Labware: "${req.variables.barcode}"` },
        ])*/
  })
];

export default passFailHandlers;
