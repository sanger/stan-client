import { graphql, HttpResponse } from 'msw';
import { SegmentationMutation, SegmentationMutationVariables } from '../../types/sdk';

import { createLabware } from './labwareHandlers';

const segmentationHandlers = [
  graphql.mutation<SegmentationMutation, SegmentationMutationVariables>('Segmentation', ({ variables }) => {
    const labware = variables.request.labware.map((lw) => {
      return createLabware(lw.barcode);
    });
    return HttpResponse.json({ data: { segmentation: { labware, operations: [{ id: 21 }] } } }, { status: 200 });
  })
];

export default segmentationHandlers;
