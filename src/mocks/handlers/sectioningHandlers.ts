import { graphql } from "msw";
import {
  ConfirmSectionMutation,
  ConfirmSectionMutationVariables,
  GetSectioningConfirmInfoQuery,
  GetSectioningConfirmInfoQueryVariables,
  GetSectioningInfoQuery,
  GetSectioningInfoQueryVariables,
  WorkStatus,
} from "../../types/sdk";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";
import commentRepository from "../repositories/commentRepository";
import workRepository from "../repositories/workRepository";

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
        works: workRepository
          .findAll()
          .filter((w) => w.status === WorkStatus.Active),
      })
    );
  }),

  graphql.mutation<ConfirmSectionMutation, ConfirmSectionMutationVariables>(
    "ConfirmSection",
    (req, res, ctx) => {
      return res(
        ctx.data({
          confirmSection: {
            labware: [],
            operations: [],
          },
        })
      );
    }
  ),
];

export default sectioningHandlers;
