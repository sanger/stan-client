import { graphql } from "msw";
import {
  ConfirmSectionMutation,
  ConfirmSectionMutationVariables,
  GetSectioningConfirmInfoQuery,
  GetSectioningConfirmInfoQueryVariables,
  GetSectioningInfoQuery,
  GetSectioningInfoQueryVariables,
} from "../../types/sdk";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";
import commentRepository from "../repositories/commentRepository";
import { buildLabwareFragment } from "../../lib/helpers/labwareHelper";
import { createLabware } from "./labwareHandlers";

const sectioningHandlers = [
  graphql.query<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>(
    "GetSectioningInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          labwareTypes: labwareTypeInstances,
        })
      );
    }
  ),

  graphql.query<
    GetSectioningConfirmInfoQuery,
    GetSectioningConfirmInfoQueryVariables
  >("GetSectioningConfirmInfo", (req, res, ctx) => {
    return res(
      ctx.data({
        comments: commentRepository
          .findAll()
          .filter((c) => c.category === "section"),
      })
    );
  }),

  graphql.mutation<ConfirmSectionMutation, ConfirmSectionMutationVariables>(
    "ConfirmSection",
    (req, res, ctx) => {
      const confirmedLabwares = req.variables.request.labware.map(
        (confirmLabware) => {
          const labware = createLabware(confirmLabware.barcode);
          return buildLabwareFragment(labware);
        }
      );
      return res(
        ctx.data({
          confirmSection: {
            labware: confirmedLabwares,
            operations: [],
          },
        })
      );
    }
  ),
];

export default sectioningHandlers;
