import { graphql } from "msw";
import {
  CreateWorkMutation,
  CreateWorkMutationVariables,
  FindWorkNumbersQuery,
  FindWorkNumbersQueryVariables,
  GetWorkAllocationInfoQuery,
  GetWorkAllocationInfoQueryVariables,
  UpdateWorkStatusMutation,
  UpdateWorkStatusMutationVariables,
} from "../../types/sdk";
import costCodeRepository from "../repositories/costCodeRepository";
import projectRepository from "../repositories/projectRepository";
import commentRepository from "../repositories/commentRepository";
import workRepository from "../repositories/workRepository";
import workFactory from "../../lib/factories/workFactory";
import { isEnabled } from "../../lib/helpers";
import workTypeRepository from "../repositories/workTypeRepository";

const workHandlers = [
  graphql.query<
    GetWorkAllocationInfoQuery,
    GetWorkAllocationInfoQueryVariables
  >("GetWorkAllocationInfo", (req, res, ctx) => {
    return res(
      ctx.data({
        costCodes: costCodeRepository.findAll().filter(isEnabled),
        projects: projectRepository.findAll().filter(isEnabled),
        comments: commentRepository
          .findAll()
          .filter(
            (comment) =>
              comment.category === req.variables.commentCategory &&
              isEnabled(comment)
          ),
        works: workRepository.findAll(),
        workTypes: workTypeRepository.findAll().filter(isEnabled),
      })
    );
  }),

  graphql.mutation<CreateWorkMutation, CreateWorkMutationVariables>(
    "CreateWork",
    (req, res, ctx) => {
      const workType = workTypeRepository.find("name", req.variables.workType);
      const costCode = costCodeRepository.find("code", req.variables.costCode);
      const project = projectRepository.find("name", req.variables.project);

      if (!workType) {
        return res(
          ctx.errors([
            { message: `Cost code ${req.variables.workType} not found` },
          ])
        );
      }

      if (!costCode) {
        return res(
          ctx.errors([
            {
              message: `Cost code ${req.variables.costCode} not found`,
            },
          ])
        );
      }

      if (!project) {
        return res(
          ctx.errors([
            {
              message: `Project ${req.variables.project} not found`,
            },
          ])
        );
      }

      const createWork = workFactory.build(undefined, {
        associations: { workType, costCode, project },
        transient: { isRnD: req.variables.prefix === "R&D" },
      });

      workRepository.save(createWork);

      return res(
        ctx.data({
          createWork,
        })
      );
    }
  ),

  graphql.mutation<UpdateWorkStatusMutation, UpdateWorkStatusMutationVariables>(
    "UpdateWorkStatus",
    (req, res, ctx) => {
      const work = workRepository.find("workNumber", req.variables.workNumber);
      if (!work) {
        return res(
          ctx.errors([
            {
              message: `Work ${req.variables.workNumber} not found`,
            },
          ])
        );
      }

      work.status = req.variables.status;
      workRepository.save(work);

      return res(
        ctx.data({
          updateWorkStatus: work,
        })
      );
    }
  ),

  graphql.query<FindWorkNumbersQuery, FindWorkNumbersQueryVariables>(
    "FindWorkNumbers",
    (req, res, ctx) => {
      return res(
        ctx.data({
          works: workRepository
            .findAll()
            .filter((w) => w.status === req.variables.status),
        })
      );
    }
  ),
];

export default workHandlers;
