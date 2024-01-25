import { graphql, HttpResponse } from 'msw';
import { GetLabwareCostingQuery, GetLabwareCostingQueryVariables, SlideCosting } from '../../types/sdk';

export const labwareCostingHandlers = [
  graphql.query<GetLabwareCostingQuery, GetLabwareCostingQueryVariables>('GetLabwareCosting', ({ variables }) => {
    if (variables.barcode.startsWith('STAN')) {
      let payload: GetLabwareCostingQuery = {
        labwareCosting: null
      };
      if (variables.barcode.endsWith('1')) {
        payload = {
          labwareCosting: SlideCosting.Sgp
        };
      }
      if (variables.barcode.endsWith('2')) {
        payload = {
          labwareCosting: SlideCosting.Faculty
        };
      }
      return HttpResponse.json({ data: payload }, { status: 200 });
    } else {
      return HttpResponse.json(
        {
          errors: [
            {
              message: `Exception while fetching data (/labware) : No labware found with barcode: ${variables.barcode}`
            }
          ]
        },
        { status: 404 }
      );
    }
  })
];
