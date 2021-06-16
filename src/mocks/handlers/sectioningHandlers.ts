import { graphql } from "msw";
import {
  ConfirmSectionMutation,
  ConfirmSectionMutationVariables,
  GetSectioningInfoQuery,
  GetSectioningInfoQueryVariables,
} from "../../types/sdk";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";

const sectioningHandlers = [
  graphql.query<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>(
    "GetSectioningInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          comments: [
            {
              __typename: "Comment",
              id: 1,
              text: "Section Folded",
              category: "section",
              enabled: true,
            },
            {
              __typename: "Comment",
              id: 2,
              text: "Poor section quality",
              category: "section",
              enabled: true,
            },
            {
              __typename: "Comment",
              id: 3,
              text: "Sectioned well",
              category: "section",
              enabled: true,
            },
            {
              __typename: "Comment",
              id: 4,
              text: "Section exploded",
              category: "section",
              enabled: true,
            },
          ],
          labwareTypes: labwareTypeInstances,
        })
      );
    }
  ),

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
