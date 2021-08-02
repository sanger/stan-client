import { graphql } from "msw";
import {
  AddCostCodeMutation,
  AddCostCodeMutationVariables,
  SetCostCodeEnabledMutation,
  SetCostCodeEnabledMutationVariables,
} from "../../types/sdk";
import costCodeFactory from "../../lib/factories/costCodeFactory";
import costCodeRepository from "../repositories/costCodeRepository";

const costCodeHandlers = [
  graphql.mutation<AddCostCodeMutation, AddCostCodeMutationVariables>(
    "AddCostCode",
    (req, res, ctx) => {
      const addCostCode = costCodeFactory.build({ code: req.variables.code });
      costCodeRepository.save(addCostCode);
      return res(ctx.data({ addCostCode }));
    }
  ),

  graphql.mutation<
    SetCostCodeEnabledMutation,
    SetCostCodeEnabledMutationVariables
  >("SetCostCodeEnabled", (req, res, ctx) => {
    const costCode = costCodeRepository.find("code", req.variables.code);
    if (costCode) {
      costCode.enabled = req.variables.enabled;
      costCodeRepository.save(costCode);
      return res(ctx.data({ setCostCodeEnabled: costCode }));
    } else {
      return res(
        ctx.errors([
          {
            message: `Could not find Cost Code: "${req.variables.code}"`,
          },
        ])
      );
    }
  }),
];

export default costCodeHandlers;
