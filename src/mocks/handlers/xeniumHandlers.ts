import { graphql } from 'msw';
import { RecordAnalyserMutation, RecordAnalyserMutationVariables } from '../../types/sdk';

const xeniumHandlers = [
  graphql.mutation<RecordAnalyserMutation, RecordAnalyserMutationVariables>('recordAnalyser', (req, res, ctx) => {
    debugger;

    return res(
      ctx.errors([
        {
          message: 'Exception while fetching data (/CytAssist) : The operation could not be validated.',
          extensions: {
            problems: ['Labware is discarded: [STAN-3111]']
          }
        }
      ])
    );
  })
];

export default xeniumHandlers;
