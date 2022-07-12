import { graphql } from "msw";
import {
  GetBlockProcessingInfoQuery,
  GetBlockProcessingInfoQueryVariables,
  GetNextReplicateNumberQuery,
  GetNextReplicateNumberQueryVariables,
  GetPotProcessingInfoQuery,
  GetPotProcessingInfoQueryVariables,
  GetSampleProcessingCommentsInfoQuery,
  GetSampleProcessingCommentsInfoQueryVariables,
  NextReplicateData,
  PerformTissueBlockMutation,
  PerformTissueBlockMutationVariables,
  PerformTissuePotMutation,
  PerformTissuePotMutationVariables,
  RecordSampleProcessingCommentsMutation,
  RecordSampleProcessingCommentsMutationVariables,
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
  graphql.query<
    GetNextReplicateNumberQuery,
    GetNextReplicateNumberQueryVariables
  >("GetNextReplicateNumber", (req, res, ctx) => {
    const sourceBarcodes = [...req.variables.barcodes];
    const nextReplicateData: NextReplicateData[] = [];
    /***Keeps labware in pairs as a group. This is to enable testing for all cases**/
    for (let indx = 0; indx < sourceBarcodes.length; indx += 2) {
      nextReplicateData.push({
        barcodes: sourceBarcodes.slice(indx, indx + 2),
        nextReplicateNumber: 5,
        donorId: 1,
        spatialLocationId: 1,
      });
    }
    return res(
      ctx.data({
        nextReplicateNumbers: nextReplicateData,
      })
    );
  }),
  graphql.query<
    GetSampleProcessingCommentsInfoQuery,
    GetSampleProcessingCommentsInfoQueryVariables
  >("GetSampleProcessingCommentsInfo", (req, res, ctx) => {
    return res(
      ctx.data({
        comments: commentRepository
          .findAll()
          .filter(
            (comment) =>
              comment.category === "Sample Processing" && comment.enabled
          ),
      })
    );
  }),
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
  graphql.mutation<
    RecordSampleProcessingCommentsMutation,
    RecordSampleProcessingCommentsMutationVariables
  >("RecordSampleProcessingComments", (req, res, ctx) => {
    const confirmedLabwares = req.variables.request.labware.map(
      (confirmLabware) => {
        const labware = createLabware(confirmLabware.barcode);
        return buildLabwareFragment(labware);
      }
    );
    return res(
      ctx.data({
        recordSampleProcessingComments: {
          labware: confirmedLabwares,
          operations: [],
        },
      })
    );
  }),
];

export default originalSampleProcessingHandlers;
