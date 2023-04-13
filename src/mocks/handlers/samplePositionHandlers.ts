import { graphql } from 'msw';
import { FindSamplePositionsQuery, FindSamplePositionsQueryVariables } from '../../types/sdk';
const samplePositionHandlers = [
  graphql.query<FindSamplePositionsQuery, FindSamplePositionsQueryVariables>('FindSamplePositions', (req, res, ctx) => {
    return res(
      ctx.data({
        samplePositions: [{ sampleId: 1, region: 'TOP', address: 'A1', slotId: 1 }]
      })
    );
  })
];

export default samplePositionHandlers;
