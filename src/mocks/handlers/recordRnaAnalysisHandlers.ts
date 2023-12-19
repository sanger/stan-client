import { graphql, HttpResponse } from 'msw';
import { RecordRnaAnalysisMutation, RecordRnaAnalysisMutationVariables } from '../../types/sdk';

const recordRnaAnalysisHandlers = [
  graphql.mutation<RecordRnaAnalysisMutation, RecordRnaAnalysisMutationVariables>('RecordRNAAnalysis', () => {
    return HttpResponse.json({ data: { recordRNAAnalysis: { operations: [] } } }, { status: 200 });
  })
];
export default recordRnaAnalysisHandlers;
