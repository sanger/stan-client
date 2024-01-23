import { graphql } from 'msw';
import { RecordRnaAnalysisMutation, RecordRnaAnalysisMutationVariables } from '../../types/sdk';

const recordRnaAnalysisHandlers = [
  graphql.mutation<RecordRnaAnalysisMutation, RecordRnaAnalysisMutationVariables>(
    'RecordRNAAnalysis',
    (req, res, ctx) => {
      /*return res(
      ctx.errors([
        {
          message: `Couldn't Record labware with barcode ${req.variables.request.labware[0].barcode} in sessionStorage`,
        },
      ])
    );*/
      return res(ctx.data({ recordRNAAnalysis: { operations: [] } }));
    }
  )
];
export default recordRnaAnalysisHandlers;
