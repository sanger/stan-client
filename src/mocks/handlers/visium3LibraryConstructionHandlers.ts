import { graphql, HttpResponse } from 'msw';
import {
  FindMeasurementValueFromLabwareOrAncestorQuery,
  FindMeasurementValueFromLabwareOrAncestorQueryVariables,
  FindReagentPlateQuery,
  FindReagentPlateQueryVariables,
  PerformLibraryConstructionMutation,
  PerformLibraryConstructionMutationVariables
} from '../../types/sdk';
import ReagentPlateFactory from '../../lib/factories/reagentPlateFactory';
import { createLabware } from './labwareHandlers';
import { faker } from '@faker-js/faker';

const handlers = [
  graphql.query<FindReagentPlateQuery, FindReagentPlateQueryVariables>('FindReagentPlate', ({ variables }) => {
    return HttpResponse.json({
      data: {
        reagentPlate: ReagentPlateFactory.build({ barcode: variables.barcode })
      }
    });
  }),

  graphql.query<
    FindMeasurementValueFromLabwareOrAncestorQuery,
    FindMeasurementValueFromLabwareOrAncestorQueryVariables
  >('FindMeasurementValueFromLabwareOrAncestor', ({ variables }) => {
    const labware = createLabware(variables.barcode);
    const measurements = labware.slots.map((slot) => ({
      address: slot.address,
      string: faker.number.float({ min: 0.1, max: 1, multipleOf: 0.1 }).toString()
    }));

    return HttpResponse.json({ data: { measurementValueFromLabwareOrAncestor: measurements } });
  }),

  graphql.mutation<PerformLibraryConstructionMutation, PerformLibraryConstructionMutationVariables>(
    'PerformLibraryConstruction',
    () => {
      return HttpResponse.json({ data: { libraryCon: { operations: [{ id: 1 }] } } });
    }
  )
];

export default handlers;
