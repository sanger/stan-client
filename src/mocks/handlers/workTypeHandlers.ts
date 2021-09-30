import { graphql } from "msw";
import {
  AddWorkTypeMutation,
  AddWorkTypeMutationVariables,
  GetWorkTypesQuery,
  GetWorkTypesQueryVariables,
  SetWorkTypeEnabledMutation,
  SetWorkTypeEnabledMutationVariables,
} from "../../types/sdk";
import workTypeRepository from "../repositories/workTypeRepository";
import workRepository from "../repositories/workRepository";

const workTypeHandlers = [
  graphql.mutation<AddWorkTypeMutation, AddWorkTypeMutationVariables>(
    "AddWorkType",
    (req, res, ctx) => {
      const workType = workTypeRepository.save({
        name: req.variables.name,
        enabled: true,
      });

      return res(
        ctx.data({
          addWorkType: workType,
        })
      );
    }
  ),

  graphql.mutation<
    SetWorkTypeEnabledMutation,
    SetWorkTypeEnabledMutationVariables
  >("SetWorkTypeEnabled", (req, res, ctx) => {
    const workType = workTypeRepository.find("name", req.variables.name);

    if (!workType) {
      return res(
        ctx.errors([
          {
            message: `Could not find Work Type "${req.variables.name}"`,
          },
        ])
      );
    } else {
      workType.enabled = req.variables.enabled;
      workTypeRepository.save(workType);
      return res(
        ctx.data({
          setWorkTypeEnabled: workType,
        })
      );
    }
  }),

  graphql.query<GetWorkTypesQuery, GetWorkTypesQueryVariables>(
    "GetWorkTypes",
    (req, res, ctx) => {
      return res(
        ctx.data({
          __typename: "Query",
          workTypes: workTypeRepository
            .findAll()
            .concat(workRepository.findAll().map((work) => work.workType)),
        })
      );
    }
  ),
];

export default workTypeHandlers;
