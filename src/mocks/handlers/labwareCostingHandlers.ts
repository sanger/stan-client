import { graphql } from 'msw';
import { GetLabwareCostingQuery, GetLabwareCostingQueryVariables, SlideCosting } from '../../types/sdk';

export const labwareCostingHandlers = [
  graphql.query<GetLabwareCostingQuery, GetLabwareCostingQueryVariables>('GetLabwareCosting', (req, res, ctx) => {
    if (req.variables.barcode.startsWith('STAN')) {
      let payload: GetLabwareCostingQuery = {
        labwareCosting: null
      };
      if (req.variables.barcode.endsWith('1')) {
        payload = {
          labwareCosting: SlideCosting.Sgp
        };
      }
      if (req.variables.barcode.endsWith('2')) {
        payload = {
          labwareCosting: SlideCosting.Faculty
        };
      }
      return res(ctx.data(payload));
    } else {
      return res(
        ctx.errors([
          {
            message: `Exception while fetching data (/labware) : No labware found with barcode: ${req.variables.barcode}`
          }
        ])
      );
    }
  })
];
