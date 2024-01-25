import { graphql } from 'msw';
import { RecordOrientationQcMutation, RecordOrientationQcMutationVariables } from '../../types/sdk';

const orientationQCHandlers = [
  graphql.mutation<RecordOrientationQcMutation, RecordOrientationQcMutationVariables>(
    'RecordOrientationQC',
    (req, res, ctx) => {
      return res(ctx.data({ recordOrientationQC: { operations: [] } }));
    }
  )
];

export default orientationQCHandlers;
