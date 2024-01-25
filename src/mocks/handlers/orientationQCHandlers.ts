import { graphql, HttpResponse } from 'msw';
import { RecordOrientationQcMutation, RecordOrientationQcMutationVariables } from '../../types/sdk';

const orientationQCHandlers = [
  graphql.mutation<RecordOrientationQcMutation, RecordOrientationQcMutationVariables>('RecordOrientationQC', () => {
    return HttpResponse.json({ data: { recordOrientationQC: { operations: [] } } }, { status: 200 });
  })
];

export default orientationQCHandlers;
