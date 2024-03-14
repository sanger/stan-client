import { graphql, HttpResponse } from 'msw';
import {
  FindMeasurementByBarcodeAndNameQuery,
  FindMeasurementByBarcodeAndNameQueryVariables,
  Labware,
  RecordOpWithSlotCommentsMutation,
  RecordOpWithSlotCommentsMutationVariables,
  RecordOpWithSlotMeasurementsMutation,
  RecordOpWithSlotMeasurementsMutationVariables,
  RecordVisiumQcMutation,
  RecordVisiumQcMutationVariables
} from '../../types/sdk';
import { isSlotFilled } from '../../lib/helpers/slotHelper';
import { faker } from '@faker-js/faker';
import { createLabware } from './labwareHandlers';

const visiumQCHandllers = [
  graphql.mutation<RecordVisiumQcMutation, RecordVisiumQcMutationVariables>('RecordVisiumQC', () => {
    return HttpResponse.json({ data: { recordVisiumQC: { operations: [{ id: 1 }] } } });
  }),
  graphql.mutation<RecordOpWithSlotMeasurementsMutation, RecordOpWithSlotMeasurementsMutationVariables>(
    'RecordOpWithSlotMeasurements',
    () => {
      return HttpResponse.json({ data: { recordOpWithSlotMeasurements: { operations: [{ id: 1 }] } } });
    }
  ),
  graphql.mutation<RecordOpWithSlotCommentsMutation, RecordOpWithSlotCommentsMutationVariables>(
    'RecordOpWithSlotComments',
    () => {
      return HttpResponse.json({ data: { recordOpWithSlotComments: { operations: [{ id: 1 }] } } });
    }
  ),

  graphql.query<FindMeasurementByBarcodeAndNameQuery, FindMeasurementByBarcodeAndNameQueryVariables>(
    'FindMeasurementByBarcodeAndName',
    ({ variables }) => {
      const labwareJson = sessionStorage.getItem(`labware-${variables.barcode}`);
      const labware: Labware = labwareJson ? JSON.parse(labwareJson) : createLabware(variables.barcode);
      const fakeCqValues = labware.slots
        .filter((slot) => isSlotFilled(slot))
        .map((slot) => {
          return {
            address: slot.address,
            string: faker.number.float({ multipleOf: 0.1 }).toString()
          };
        });
      return HttpResponse.json({
        data: {
          measurementValueFromLabwareOrParent: fakeCqValues
        }
      });
    }
  )
];

export default visiumQCHandllers;
