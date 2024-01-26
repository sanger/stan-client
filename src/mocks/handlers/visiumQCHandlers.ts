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
    (req, res, ctx) => {
      const labwareJson = sessionStorage.getItem(`labware-${req.variables.barcode}`);
      const labware: Labware = labwareJson ? JSON.parse(labwareJson) : createLabware(req.variables.barcode);
      const fakeCqValues = labware.slots
        .filter((slot) => isSlotFilled(slot))
        .map((slot) => {
          return {
            address: slot.address,
            string: faker.number.float({ min: 0.1, max: 5, precision: 0.1 }).toString()
          };
        });
      return res(
        ctx.data({
          measurementValueFromLabwareOrParent: fakeCqValues
        })
      );
    }
  )
];

export default visiumQCHandllers;
