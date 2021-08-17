import { graphql } from "msw";
import {
  AddWorkTypeMutation,
  AddWorkTypeMutationVariables,
  SetWorkTypeEnabledMutation,
  SetWorkTypeEnabledMutationVariables,
} from "../../types/sdk";
import workTypeRepository from "../repositories/workTypeRepository";

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
];

export default workTypeHandlers;
