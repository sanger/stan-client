import { graphql } from "msw";
import {
  CreateWorkMutation,
  CreateWorkMutationVariables,
  FindWorkNumbersQuery,
  FindWorkNumbersQueryVariables,
  GetWorkNumbersQuery,
  GetWorkNumbersQueryVariables,
  GetWorkAllocationInfoQuery,
  GetWorkAllocationInfoQueryVariables,
  UpdateWorkNumBlocksMutation,
  UpdateWorkNumBlocksMutationVariables,
  UpdateWorkNumSlidesMutation,
  UpdateWorkNumSlidesMutationVariables,
  UpdateWorkPriorityMutation,
  UpdateWorkPriorityMutationVariables,
  UpdateWorkStatusMutation,
  UpdateWorkStatusMutationVariables,
  WorkStatus,
} from "../../types/sdk";
import costCodeRepository from "../repositories/costCodeRepository";
import projectRepository from "../repositories/projectRepository";
import commentRepository from "../repositories/commentRepository";
import workRepository from "../repositories/workRepository";
import workFactory from "../../lib/factories/workFactory";
import { isEnabled } from "../../lib/helpers";
import workTypeRepository from "../repositories/workTypeRepository";
import { sample } from "lodash";
import releaseRecipientRepository from "../repositories/releaseRecipientRepository";

const workHandlers = [
  graphql.query<
    GetWorkAllocationInfoQuery,
    GetWorkAllocationInfoQueryVariables
  >("GetWorkAllocationInfo", (req, res, ctx) => {
    const comments = commentRepository
      .findAll()
      .filter(
        (comment) =>
          comment.category === req.variables.commentCategory &&
          isEnabled(comment)
      );
    let works = workRepository.findAll();

    if (req.variables.workStatuses) {
      let workStatuses = Array.isArray(req.variables.workStatuses)
        ? req.variables.workStatuses
        : [req.variables.workStatuses];

      if (workStatuses.length > 0) {
        works = works.filter((work) => workStatuses.includes(work.status));
      }
    }

    return res(
      ctx.data({
        costCodes: costCodeRepository.findAll().filter(isEnabled),
        projects: projectRepository.findAll().filter(isEnabled),
        comments,
        worksWithComments: works.map((work) => {
          return {
            work,
            comment: [
              WorkStatus.Failed,
              WorkStatus.Paused,
              WorkStatus.Withdrawn,
            ].includes(work.status)
              ? sample(comments)?.text
              : undefined,
          };
        }),
        workTypes: workTypeRepository.findAll().filter(isEnabled),
        releaseRecipients: releaseRecipientRepository.findAll().filter(isEnabled)
      })
    );
  }),

  graphql.mutation<CreateWorkMutation, CreateWorkMutationVariables>(
    "CreateWork",
    (req, res, ctx) => {
      const workType = workTypeRepository.find("name", req.variables.workType);
      const costCode = costCodeRepository.find("code", req.variables.costCode);
      const project = projectRepository.find("name", req.variables.project);
      const workRequester = releaseRecipientRepository.find("username", req.variables.workRequester);

      if (!workType) {
        return res(
          ctx.errors([
            { message: `Work type ${req.variables.workType} not found` },
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

      if (!workRequester) {
        return res(
          ctx.errors([
            { message: `Work requester ${req.variables.workRequester} not found` },
          ])
        );
      }

      const createWork = workFactory.build(
        {
          numSlides: req.variables.numSlides,
          numBlocks: req.variables.numBlocks,
          numOriginalSamples: req.variables.numOriginalSamples
        },
        {
          associations: { workType, costCode, project, workRequester },
          transient: { isRnD: req.variables.prefix === "R&D" },
        }
      );

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

      let comment = null;

      if (req.variables.commentId) {
        comment = commentRepository.find("id", req.variables.commentId)?.text;
      }

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
          updateWorkStatus: {
            work,
            comment,
          },
        })
      );
    }
  ),
  graphql.mutation<
    UpdateWorkNumBlocksMutation,
    UpdateWorkNumBlocksMutationVariables
  >("UpdateWorkNumBlocks", (req, res, ctx) => {
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
    work.numBlocks = req.variables.numBlocks;
    workRepository.save(work);
    return res(
      ctx.data({
        updateWorkNumBlocks: work,
      })
    );
  }),

  graphql.mutation<
    UpdateWorkNumSlidesMutation,
    UpdateWorkNumSlidesMutationVariables
  >("UpdateWorkNumSlides", (req, res, ctx) => {
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
    work.numSlides = req.variables.numSlides;
    workRepository.save(work);
    return res(
      ctx.data({
        updateWorkNumSlides: work,
      })
    );
  }),

  graphql.mutation<
    UpdateWorkPriorityMutation,
    UpdateWorkPriorityMutationVariables
  >("UpdateWorkPriority", (req, res, ctx) => {
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
    work.priority = req.variables.priority;
    workRepository.save(work);
    return res(
      ctx.data({
        updateWorkPriority: work,
      })
    );
  }),

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

  graphql.query<GetWorkNumbersQuery, GetWorkNumbersQueryVariables>(
    "GetWorkNumbers",
    (req, res, ctx) => {
      return res(
        ctx.data({
          works: workRepository.findAll()
        })
      );
    }
  ),
];

export default workHandlers;
