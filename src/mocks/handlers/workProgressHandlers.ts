import { graphql } from "msw";
import {
  FindWorkProgressQuery,
  FindWorkProgressQueryVariables,
  WorkProgressTimestamp,
  WorkStatus,
} from "../../types/sdk";
import workRepository from "../repositories/workRepository";

function buildWorkProgressTimeStamps(): Array<WorkProgressTimestamp> {
  return [
    { type: "Section", timestamp: new Date().toISOString() },
    { type: "Stain", timestamp: new Date().toISOString() },
    { type: "Extract", timestamp: new Date().toISOString() },
    { type: "Visium cDNA", timestamp: new Date().toISOString() },
    { type: "Stain Visium TO", timestamp: new Date().toISOString() },
    { type: "Stain Visium LP", timestamp: new Date().toISOString() },
    { type: "RNAscope/IHC stain", timestamp: new Date().toISOString() },
    { type: "Image", timestamp: new Date().toISOString() },
    { type: "Analysis", timestamp: new Date().toISOString() },
  ];
}

const workProgressHandlers = [
  graphql.query<FindWorkProgressQuery, FindWorkProgressQueryVariables>(
    "FindWorkProgress",
    (req, res, ctx) => {
      const { workNumber, workType, status } = req.variables;
      const works = workRepository.findAll().map((work, indx) => {
        const status =
          indx % 2 === 0
            ? WorkStatus.Active
            : indx % 3 === 1
            ? WorkStatus.Completed
            : WorkStatus.Paused;
        return { ...work, status: status };
      });

      if (workNumber) {
        return res(
          ctx.data({
            __typename: "Query",
            workProgress: works.map((work) => {
              return {
                __typename: "WorkProgress",
                work: work,
                timestamps: buildWorkProgressTimeStamps(),
              };
            }),
          })
        );
      }
      if (workType) {
        return res(
          ctx.data({
            __typename: "Query",
            workProgress: works
              .filter((work) => work.workType.name === workType)
              .map((work) => {
                return {
                  __typename: "WorkProgress",
                  work: work,
                  timestamps: buildWorkProgressTimeStamps(),
                };
              }),
          })
        );
      }
      if (status) {
        return res(
          ctx.data({
            __typename: "Query",
            workProgress: works
              .filter((work) => work.status === status)
              .map((work) => {
                return {
                  __typename: "WorkProgress",
                  work: work,
                  timestamps: buildWorkProgressTimeStamps(),
                };
              }),
          })
        );
      }

      return res(
        ctx.errors([
          {
            message: `Could not find Work progress}"`,
          },
        ])
      );
    }
  ),
];

export default workProgressHandlers;
