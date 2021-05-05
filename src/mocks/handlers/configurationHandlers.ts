import { graphql } from "msw";
import {
  GetConfigurationQuery,
  GetConfigurationQueryVariables,
} from "../../types/sdk";
import releaseDestinationRepository from "../repositories/releaseDestinationRepository";
import releaseRecipientRepository from "../repositories/releaseRecipientRepository";
import commentRepository from "../repositories/commentRepository";
import hmdmcRepository from "../repositories/hmdmcRepository";
import speciesRepository from "../repositories/speciesRepository";
import destructionReasonRepository from "../repositories/destructionReasonRepository";

const configurationHandlers = [
  graphql.query<GetConfigurationQuery, GetConfigurationQueryVariables>(
    "GetConfiguration",
    (req, res, ctx) => {
      return res(
        ctx.data({
          destructionReasons: destructionReasonRepository.findAll(),
          releaseRecipients: releaseRecipientRepository.findAll(),
          comments: commentRepository.findAll(),
          releaseDestinations: releaseDestinationRepository.findAll(),
          hmdmcs: hmdmcRepository.findAll(),
          species: speciesRepository.findAll(),
        })
      );
    }
  ),
];

export default configurationHandlers;
