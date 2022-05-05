import { graphql } from "msw";
import {
  AddSolutionSampleMutation,
  AddSolutionSampleMutationVariables,
  SetSolutionSampleEnabledMutation,
  SetSolutionSampleEnabledMutationVariables,
} from "../../types/sdk";
import solutionSampleRepository from "../repositories/solutionSampleRepository";
import solutionSampleFactory from "../../lib/factories/solutionSampleFactory";

const solutionSampleHandlers = [
  graphql.mutation<
    AddSolutionSampleMutation,
    AddSolutionSampleMutationVariables
  >("AddSolutionSample", (req, res, ctx) => {
    const addSolutionSample = solutionSampleFactory.build({
      name: req.variables.name,
    });
    solutionSampleRepository.save(addSolutionSample);
    return res(ctx.data({ addSolutionSample }));
  }),

  graphql.mutation<
    SetSolutionSampleEnabledMutation,
    SetSolutionSampleEnabledMutationVariables
  >("SetSolutionSampleEnabled", (req, res, ctx) => {
    const solutionSample = solutionSampleRepository.find(
      "name",
      req.variables.solutionSample
    );
    if (solutionSample) {
      solutionSample.enabled = req.variables.enabled;
      solutionSampleRepository.save(solutionSample);
      return res(ctx.data({ setSolutionSampleEnabled: solutionSample }));
    } else {
      return res(
        ctx.errors([
          {
            message: `Could not find equipment: "${req.variables.solutionSample}"`,
          },
        ])
      );
    }
  }),
];

export default solutionSampleHandlers;
