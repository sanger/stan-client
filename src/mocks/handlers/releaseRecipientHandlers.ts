import { graphql } from "msw";
import {
  AddReleaseRecipientMutation,
  AddReleaseRecipientMutationVariables,
  SetReleaseRecipientEnabledMutation,
  SetReleaseRecipientEnabledMutationVariables,
} from "../../types/sdk";
import releaseRecipientFactory from "../../lib/factories/releaseRecipientFactory";
import releaseRecipientRepository from "../repositories/releaseRecipientRepository";

const releaseRecipientHandlers = [
  graphql.mutation<
    AddReleaseRecipientMutation,
    AddReleaseRecipientMutationVariables
  >("AddReleaseRecipient", (req, res, ctx) => {
    const addReleaseRecipient = releaseRecipientFactory.build({
      username: req.variables.username,
    });
    releaseRecipientRepository.save(addReleaseRecipient);
    return res(ctx.data({ addReleaseRecipient }));
  }),

  graphql.mutation<
    SetReleaseRecipientEnabledMutation,
    SetReleaseRecipientEnabledMutationVariables
  >("SetReleaseRecipientEnabled", (req, res, ctx) => {
    const releaseRecipient = releaseRecipientRepository.find(
      "username",
      req.variables.username
    );
    if (releaseRecipient) {
      releaseRecipient.enabled = req.variables.enabled;
      releaseRecipientRepository.save(releaseRecipient);
      return res(ctx.data({ setReleaseRecipientEnabled: releaseRecipient }));
    } else {
      return res(
        ctx.errors([
          {
            message: `Could not find release recipient: "${req.variables.username}"`,
          },
        ])
      );
    }
  }),
];

export default releaseRecipientHandlers;
