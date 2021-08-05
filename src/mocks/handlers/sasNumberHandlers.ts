import { graphql } from "msw";
import {
  CreateSasNumberMutation,
  CreateSasNumberMutationVariables,
  GetSasAllocationInfoQuery,
  GetSasAllocationInfoQueryVariables,
  UpdateSasNumberStatusMutation,
  UpdateSasNumberStatusMutationVariables,
} from "../../types/sdk";
import costCodeRepository from "../repositories/costCodeRepository";
import projectRepository from "../repositories/projectRepository";
import commentRepository from "../repositories/commentRepository";
import sasNumberRepository from "../repositories/sasNumberRepository";
import sasNumberFactory from "../../lib/factories/sasNumberFactory";
import { isEnabled } from "../../lib/helpers";

const sasNumberHandlers = [
  graphql.query<GetSasAllocationInfoQuery, GetSasAllocationInfoQueryVariables>(
    "GetSasAllocationInfo",
    (req, res, ctx) => {
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
          sasNumbers: sasNumberRepository.findAll(),
        })
      );
    }
  ),

  graphql.mutation<CreateSasNumberMutation, CreateSasNumberMutationVariables>(
    "CreateSasNumber",
    (req, res, ctx) => {
      const costCode = costCodeRepository.find("code", req.variables.costCode);
      const project = projectRepository.find("name", req.variables.project);

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

      const createSasNumber = sasNumberFactory.build(undefined, {
        associations: { costCode, project },
        transient: { isRnD: req.variables.prefix === "R&D" },
      });

      sasNumberRepository.save(createSasNumber);

      return res(
        ctx.data({
          createSasNumber,
        })
      );
    }
  ),

  graphql.mutation<
    UpdateSasNumberStatusMutation,
    UpdateSasNumberStatusMutationVariables
  >("UpdateSasNumberStatus", (req, res, ctx) => {
    const sasNumber = sasNumberRepository.find(
      "sasNumber",
      req.variables.sasNumber
    );
    if (!sasNumber) {
      return res(
        ctx.errors([
          {
            message: `SAS number ${req.variables.sasNumber} not found`,
          },
        ])
      );
    }

    sasNumber.status = req.variables.status;
    sasNumberRepository.save(sasNumber);

    return res(
      ctx.data({
        updateSasNumberStatus: sasNumber,
      })
    );
  }),
];

export default sasNumberHandlers;
