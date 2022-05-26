import { graphql } from "msw";
import {
  GetTissueBlockProcessingInfoQuery,
  GetTissueBlockProcessingInfoQueryVariables,
  PerformTissueBlockMutation,
  PerformTissueBlockMutationVariables,
} from "../../types/sdk";
import { createLabware } from "./labwareHandlers";
import { buildLabwareFragment } from "../../lib/helpers/labwareHelper";
import commentRepository from "../repositories/commentRepository";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";

const blockProcessingHandlers = [
  graphql.query<
    GetTissueBlockProcessingInfoQuery,
    GetTissueBlockProcessingInfoQueryVariables
  >("GetTissueBlockProcessingInfo", (req, res, ctx) => {
    return res(
      ctx.data({
        mediums: [{ name: "OCT" }, { name: "Paraffin" }, { name: "None" }],
        comments: commentRepository
          .findAll()
          .filter(
            (comment) =>
              comment.category === "Tissue Block processing" && comment.enabled
          ),
        labwareTypes: labwareTypeInstances,
      })
    );
  }),
  graphql.mutation<
    PerformTissueBlockMutation,
    PerformTissueBlockMutationVariables
  >("PerformTissueBlock", (req, res, ctx) => {
    debugger;
    const confirmedLabwares = req.variables.request.labware.map(
      (confirmLabware) => {
        const labware = createLabware(confirmLabware.sourceBarcode);
        return buildLabwareFragment(labware);
      }
    );
    debugger;
    return res(
      ctx.data({
        performTissueBlock: {
          labware: confirmedLabwares,
          operations: [],
        },
      })
    );
  }),
];

export default blockProcessingHandlers;
