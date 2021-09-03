import { graphql } from "msw";
import {
  GetStainInfoQuery,
  GetStainInfoQueryVariables,
  StainMutation,
  StainMutationVariables,
} from "../../types/sdk";
import stainTypeRepository from "../repositories/stainTypeRepository";

const stainingHandlers = [
  graphql.query<GetStainInfoQuery, GetStainInfoQueryVariables>(
    "GetStainInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          stainTypes: stainTypeRepository.findAll(),
        })
      );
    }
  ),

  graphql.mutation<StainMutation, StainMutationVariables>(
    "Stain",
    (req, res, ctx) => {
      return res(
        ctx.data({
          stain: {
            operations: [
              {
                id: 1,
              },
            ],
          },
        })
      );
    }
  ),
];

export default stainingHandlers;
