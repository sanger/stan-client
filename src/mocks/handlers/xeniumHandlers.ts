import { graphql, HttpResponse } from 'msw';
import commentRepository from '../repositories/commentRepository';
import { RecordAnalyserMutation, RecordAnalyserMutationVariables } from '../../types/sdk';

const xeniumHandlers = [
  //Get Xenium QC Info
  graphql.query('GetXeniumQCInfo', () => {
    return HttpResponse.json({
      data: {
        comments: commentRepository.findAll().filter((comment) => comment.category === 'Xenium QC' && comment.enabled)
      }
    });
  }),
  //Record Analyser mutatio
  graphql.mutation<RecordAnalyserMutation, RecordAnalyserMutationVariables>('RecordAnalyser', () => {
    return HttpResponse.json({ data: { recordAnalyser: { operations: [{ id: 1 }] } } });
  }),
  //Record QC Labware mutation
  graphql.mutation('RecordQCLabware', () => {
    return HttpResponse.json({ data: { recordQcLabware: { operations: [{ id: 1 }] } } });
  })
];

export default xeniumHandlers;
