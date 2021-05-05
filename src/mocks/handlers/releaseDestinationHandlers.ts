import { graphql } from "msw";
import {
  AddReleaseDestinationMutation,
  AddReleaseDestinationMutationVariables,
  SetReleaseDestinationEnabledMutation,
  SetReleaseDestinationEnabledMutationVariables,
} from "../../types/sdk";
import releaseDestinationFactory from "../../lib/factories/releaseDestinationFactory";
import releaseDestinationRepository from "../repositories/releaseDestinationRepository";

const releaseDestinationHandlers = [
  graphql.mutation<
    AddReleaseDestinationMutation,
    AddReleaseDestinationMutationVariables
  >("AddReleaseDestination", (req, res, ctx) => {
    const addReleaseDestination = releaseDestinationFactory.build({
      name: req.variables.name,
    });
    releaseDestinationRepository.save(addReleaseDestination);
    return res(ctx.data({ addReleaseDestination }));
  }),

  graphql.mutation<
    SetReleaseDestinationEnabledMutation,
    SetReleaseDestinationEnabledMutationVariables
  >("SetReleaseDestinationEnabled", (req, res, ctx) => {
    const releaseDestination = releaseDestinationRepository.find(
      "name",
      req.variables.name
    );
    if (releaseDestination) {
      releaseDestination.enabled = req.variables.enabled;
      releaseDestinationRepository.save(releaseDestination);
      return res(
        ctx.data({ setReleaseDestinationEnabled: releaseDestination })
      );
    } else {
      return res(
        ctx.errors([
          {
            message: `Could not find release destination: "${req.variables.name}"`,
          },
        ])
      );
    }
  }),
];

export default releaseDestinationHandlers;
