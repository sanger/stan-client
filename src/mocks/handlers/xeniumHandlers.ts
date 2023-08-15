import { graphql } from 'msw';
import { RecordAnalyserMutation, RecordAnalyserMutationVariables } from '../../types/sdk';

const xeniumHandlers = [
  graphql.mutation<RecordAnalyserMutation, RecordAnalyserMutationVariables>('recordAnalyser', (req, res, ctx) => {
    return res(
      ctx.data({
        recordAnalyser: {
          operations: [
            {
              id: 1
            }
          ]
        }
      })
    );
  })
];

export default xeniumHandlers;
