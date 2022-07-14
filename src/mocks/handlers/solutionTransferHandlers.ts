import { graphql } from "msw";
import {
  GetSolutionTransferInfoQuery,
  GetSolutionTransferInfoQueryVariables,
  PerformSolutionTransferMutation,
  PerformSolutionTransferMutationVariables,
} from "../../types/sdk";
import { createLabware } from "./labwareHandlers";
import { buildLabwareFragment } from "../../lib/helpers/labwareHelper";
import solutionRepository from "../repositories/solutionRepository";

const solutionTransferHandlers = [
  graphql.query<
    GetSolutionTransferInfoQuery,
    GetSolutionTransferInfoQueryVariables
  >("GetSolutionTransferInfo", (req, res, ctx) => {
    return res(
      ctx.data({
        solutions: solutionRepository.findAll().filter((soln) => soln.enabled),
      })
    );
  }),

  graphql.mutation<
    PerformSolutionTransferMutation,
    PerformSolutionTransferMutationVariables
  >("PerformSolutionTransfer", (req, res, ctx) => {
    const confirmedLabwares = req.variables.request.labware.map(
      (confirmLabware) => {
        const labware = createLabware(confirmLabware.barcode);
        return buildLabwareFragment(labware);
      }
    );

    return res(
      ctx.data({
        performSolutionTransfer: {
          labware: confirmedLabwares,
          operations: [],
        },
      })
    );
  }),
];

export default solutionTransferHandlers;
