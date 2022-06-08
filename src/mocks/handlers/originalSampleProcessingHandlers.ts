import { graphql } from "msw";
import {
  GetBlockProcessingInfoQuery,
  GetBlockProcessingInfoQueryVariables,
  GetPotProcessingInfoQuery,
  GetPotProcessingInfoQueryVariables,
  PerformTissueBlockMutation,
  PerformTissueBlockMutationVariables,
  PerformTissuePotMutation,
  PerformTissuePotMutationVariables,
} from "../../types/sdk";
import { createLabware } from "./labwareHandlers";
import { buildLabwareFragment } from "../../lib/helpers/labwareHelper";
import commentRepository from "../repositories/commentRepository";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";
import fixativeRepository from "../repositories/fixativeRepository";
import labwareFactory from "../../lib/factories/labwareFactory";

const originalSampleProcessingHandlers = [
  graphql.query<
    GetBlockProcessingInfoQuery,
    GetBlockProcessingInfoQueryVariables
  >("GetBlockProcessingInfo", (req, res, ctx) => {
    return res(
      ctx.data({
        mediums: [{ name: "None" }, { name: "OCT" }, { name: "Paraffin" }],
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
  graphql.query<GetPotProcessingInfoQuery, GetPotProcessingInfoQueryVariables>(
    "GetPotProcessingInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          comments: commentRepository
            .findAll()
            .filter(
              (comment) =>
                comment.category === "Tissue Pot processing" && comment.enabled
            ),
          labwareTypes: labwareTypeInstances,
          fixatives: fixativeRepository
            .findAll()
            .filter((fixative) => fixative.enabled),
        })
      );
    }
  ),
  graphql.mutation<
    PerformTissueBlockMutation,
    PerformTissueBlockMutationVariables
  >("PerformTissueBlock", (req, res, ctx) => {
    const confirmedLabwares = req.variables.request.labware.map(
      (confirmLabware) => {
        const labware = createLabware(confirmLabware.sourceBarcode);
        return buildLabwareFragment(labware);
      }
    );

    return res(
      ctx.data({
        performTissueBlock: {
          labware: confirmedLabwares,
          operations: [],
        },
      })
    );
  }),
  graphql.mutation<PerformTissuePotMutation, PerformTissuePotMutationVariables>(
    "PerformTissuePot",
    (req, res, ctx) => {
      const confirmedLabwares = req.variables.request.destinations.map(() => {
        const labware = labwareFactory.build({ id: Math.random() });
        return buildLabwareFragment(labware);
      });

      return res(
        ctx.data({
          performPotProcessing: {
            labware: confirmedLabwares,
            operations: [],
          },
        })
      );
    }
  ),
];

export default originalSampleProcessingHandlers;
