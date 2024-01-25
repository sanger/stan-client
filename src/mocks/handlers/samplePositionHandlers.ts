import { graphql, HttpResponse } from 'msw';
import { FindSamplePositionsQuery, FindSamplePositionsQueryVariables } from '../../types/sdk';
const samplePositionHandlers = [
  graphql.query<FindSamplePositionsQuery, FindSamplePositionsQueryVariables>('FindSamplePositions', ({ variables }) => {
    return HttpResponse.json(
      { data: { samplePositions: [{ sampleId: 1, region: 'TOP', address: 'A1', slotId: 1, operationId: 1 }] } },
      { status: 200 }
    );
  })
];

export default samplePositionHandlers;
