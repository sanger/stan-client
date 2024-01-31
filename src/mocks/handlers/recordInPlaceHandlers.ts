import { graphql, HttpResponse } from 'msw';
import {
  GetRecordInPlaceInfoQuery,
  GetRecordInPlaceInfoQueryVariables,
  RecordInPlaceMutation,
  RecordInPlaceMutationVariables
} from '../../types/sdk';
import equipmentRepository from '../repositories/equipmentRepository';
import { isEnabled } from '../../lib/helpers';

const recordInPlaceHandlers = [
  graphql.query<GetRecordInPlaceInfoQuery, GetRecordInPlaceInfoQueryVariables>(
    'GetRecordInPlaceInfo',
    ({ variables }) => {
      let equipments = equipmentRepository.findAll().filter(isEnabled);

      if (variables.category) {
        equipments = equipments.filter((equipment) => equipment.category === variables.category);
      }
      return HttpResponse.json({ data: { equipments } }, { status: 200 });
    }
  ),

  graphql.mutation<RecordInPlaceMutation, RecordInPlaceMutationVariables>('RecordInPlace', () => {
    return HttpResponse.json({ data: { recordInPlace: { labware: [] } } }, { status: 200 });
  })
];

export default recordInPlaceHandlers;
