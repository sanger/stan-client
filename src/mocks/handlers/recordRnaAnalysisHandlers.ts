import { graphql } from "msw";
import {
  RecordRnaAnalysisMutation,
  RecordRnaAnalysisMutationVariables,
} from "../../types/sdk";

const recordRnaAnalysisHandlers = [
  graphql.mutation<
    RecordRnaAnalysisMutation,
    RecordRnaAnalysisMutationVariables
  >("RecordRNAAnalysis", (req, res, ctx) => {
    debugger;
    return res(ctx.data({ recordRNAAnalysis: { operations: [] } }));
  }),
];
export default recordRnaAnalysisHandlers;
