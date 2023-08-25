import { graphql } from 'msw';
import commentRepository from '../repositories/commentRepository';
import { RecordAnalyserMutation, RecordAnalyserMutationVariables } from '../../types/sdk';

const xeniumHandlers = [
  //Get Xenium QC Info
  graphql.query('GetXeniumQCInfo', (req, res, ctx) => {
    return res(
      ctx.data({
        comments: commentRepository.findAll().filter((comment) => comment.category === 'QC labware' && comment.enabled)
      })
    );
  }),
  //Record Analyser mutatio
  graphql.mutation<RecordAnalyserMutation, RecordAnalyserMutationVariables>('RecordAnalyser', (req, res, ctx) => {
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
  }),
  //Record QC Labware mutation
  graphql.mutation('RecordQCLabware', (req, res, ctx) => {
    return res(
      ctx.data({
        recordQcLabware: {
          operations: [{ id: 1 }]
        }
      })
    );
  })
];

export default xeniumHandlers;
