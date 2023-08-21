import { graphql } from 'msw';
import commentRepository from '../repositories/commentRepository';

const xeniumHandlers = [
  //Get Xenium QC Info
  graphql.query('GetXeniumQCInfo', (req, res, ctx) => {
    return res(
      ctx.data({
        comments: commentRepository.findAll().filter((comment) => comment.category === 'Xenium QC' && comment.enabled)
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
