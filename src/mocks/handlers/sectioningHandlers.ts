import { graphql } from "msw";
import {
  GetSectioningInfoQuery,
  GetSectioningInfoQueryVariables,
} from "../../types/graphql";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";

const sectioningHandlers = [
  graphql.query<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>(
    "GetSectioningInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          comments: [
            {
              id: 1,
              text: "Section Folded",
              category: "section",
            },
            {
              id: 2,
              text: "Poor section quality",
              category: "section",
            },
            {
              id: 3,
              text: "Sectioned well",
              category: "section",
            },
            {
              id: 4,
              text: "Section exploded",
              category: "section",
            },
          ],
          labwareTypes: labwareTypeInstances,
        })
      );
    }
  ),
];

export default sectioningHandlers;
