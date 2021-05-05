import { graphql } from "msw";
import {
  AddHmdmcMutation,
  AddHmdmcMutationVariables,
  SetHmdmcEnabledMutation,
  SetHmdmcEnabledMutationVariables,
} from "../../types/sdk";
import hmdmcFactory from "../../lib/factories/hmdmcFactory";
import hmdmcRepository from "../repositories/hmdmcRepository";

const hmdmcHandlers = [
  graphql.mutation<AddHmdmcMutation, AddHmdmcMutationVariables>(
    "AddHmdmc",
    (req, res, ctx) => {
      const addHmdmc = hmdmcFactory.build({
        hmdmc: req.variables.hmdmc,
      });
      hmdmcRepository.save(addHmdmc);
      return res(ctx.data({ addHmdmc }));
    }
  ),

  graphql.mutation<SetHmdmcEnabledMutation, SetHmdmcEnabledMutationVariables>(
    "SetHmdmcEnabled",
    (req, res, ctx) => {
      const hmdmc = hmdmcRepository.find("hmdmc", req.variables.hmdmc);
      if (hmdmc) {
        hmdmc.enabled = req.variables.enabled;
        hmdmcRepository.save(hmdmc);
        return res(ctx.data({ setHmdmcEnabled: hmdmc }));
      } else {
        return res(
          ctx.errors([
            {
              message: `Could not find HMDMC: "${req.variables.hmdmc}"`,
            },
          ])
        );
      }
    }
  ),
];

export default hmdmcHandlers;
