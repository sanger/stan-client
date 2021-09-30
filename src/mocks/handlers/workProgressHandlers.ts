import { graphql } from "msw";
import {
  FindWorkProgressQuery,
  FindWorkProgressQueryVariables,
  WorkProgressTimestamp,
} from "../../types/sdk";
import workRepository from "../repositories/workRepository";

function buildWorkProgressTimeStamps(): Array<WorkProgressTimestamp> {
  return [
    { type: "Section", timestamp: new Date().toISOString() },
    { type: "Stain", timestamp: new Date().toISOString() },
    { type: "Extract", timestamp: new Date().toISOString() },
    { type: "Visium cDNA", timestamp: new Date().toISOString() },
  ];
}

const workProgressHandlers = [
  graphql.query<FindWorkProgressQuery, FindWorkProgressQueryVariables>(
    "FindWorkProgress",
    (req, res, ctx) => {
      const { workNumber, workType, status } = req.variables;
      debugger;
      if (workNumber) {
        return res(
          ctx.data({
            __typename: "Query",
            workProgress: workRepository.findAll().map((work) => {
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
            workProgress: workRepository
              .findAll()
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
        debugger;
        return res(
          ctx.data({
            __typename: "Query",
            workProgress: workRepository
              .findAll()
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
      {
        return res(
          ctx.data({
            __typename: "Query",
            workProgress: [],
          })
        );
      }
    }
  ),
];

export default workProgressHandlers;
