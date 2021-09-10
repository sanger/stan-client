import { graphql } from "msw";
import {
  GetRecordInPlaceInfoQuery,
  GetRecordInPlaceInfoQueryVariables,
  RecordInPlaceMutation,
  RecordInPlaceMutationVariables,
} from "../../types/sdk";
import equipmentRepository from "../repositories/equipmentRepository";
import { isEnabled } from "../../lib/helpers";

const recordInPlaceHandlers = [
  graphql.query<GetRecordInPlaceInfoQuery, GetRecordInPlaceInfoQueryVariables>(
    "GetRecordInPlaceInfo",
    (req, res, ctx) => {
      let equipments = equipmentRepository.findAll().filter(isEnabled);

      if (req.variables.category) {
        equipments = equipments.filter(
          (equipment) => equipment.category === req.variables.category
        );
      }

      return res(
        ctx.data({
          equipments,
        })
      );
    }
  ),

  graphql.mutation<RecordInPlaceMutation, RecordInPlaceMutationVariables>(
    "RecordInPlace",
    (req, res, ctx) => {
      return res(ctx.data({ recordInPlace: { labware: [] } }));
    }
  ),
];

export default recordInPlaceHandlers;
