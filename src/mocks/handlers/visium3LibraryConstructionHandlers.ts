import { graphql, HttpResponse } from 'msw';
import {
  FindReagentPlateQuery,
  FindReagentPlateQueryVariables,
  PerformLibraryConstructionMutation,
  PerformLibraryConstructionMutationVariables
} from '../../types/sdk';
import ReagentPlateFactory from '../../lib/factories/reagentPlateFactory';

const handlers = [
  graphql.query<FindReagentPlateQuery, FindReagentPlateQueryVariables>('FindReagentPlate', ({ variables }) => {
    return HttpResponse.json({
      data: {
        reagentPlate: ReagentPlateFactory.build({ barcode: variables.barcode })
      }
    });
  }),

  graphql.mutation<PerformLibraryConstructionMutation, PerformLibraryConstructionMutationVariables>(
    'PerformLibraryConstruction',
    () => {
      return HttpResponse.json({ data: { libraryCon: { operations: [{ id: 1 }] } } });
    }
  )
];

export default handlers;
