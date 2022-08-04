import { graphql } from "msw";
import {
  ExtractMutation,
  ExtractMutationVariables,
  GetRecordExtractResultInfoQuery,
  GetRecordExtractResultInfoQueryVariables,
  RecordExtractResultMutation,
  RecordExtractResultMutationVariables,
} from "../../types/sdk";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";
import labwareFactory from "../../lib/factories/labwareFactory";
import commentRepository from "../repositories/commentRepository";

const extractionHandlers = [
  graphql.mutation<ExtractMutation, ExtractMutationVariables>(
    "Extract",
    (req, res, ctx) => {
      const extract: ExtractMutation["extract"] =
        req.variables.request.barcodes.reduce<ExtractMutation["extract"]>(
          (memo, barcode) => {
            // Fetch the labware out of session storage
            const labwareJson = sessionStorage.getItem(`labware-${barcode}`);

            if (!labwareJson) {
              throw new Error(
                `Couldn't find labware with barcode ${barcode} in sessionStorage`
              );
            }

            // Parse it
            const labware = JSON.parse(labwareJson);

            // Find the requested labware type by name
            const labwareType = labwareTypeInstances.find(
              (lt) => lt.name === req.variables.request.labwareType
            );
            // Create the new bit of destination labware using the same slots and samples as the source
            const newLabware = labwareFactory.build({
              labwareType,
              slots: labware.slots,
            });
            memo.labware.push(newLabware);

            let action = {
              sample: {
                id: labware.slots[0].samples[0].sampleId,
              },
              source: {
                address: "A1",
                labwareId: labware.id,
                samples: [
                  {
                    id: labware.slots[0].samples[0].sampleId,
                  },
                ],
              },
              destination: {
                address: "A1",
                labwareId: newLabware.id,
              },
            };

            memo.operations[0].actions.push(action);
            return memo;
          },
          {
            labware: [],
            operations: [{ operationType: { name: "Extract" }, actions: [] }],
          }
        );

      return res(
        ctx.data({
          extract: {
            labware: extract.labware,
            operations: extract.operations,
          },
        })
      );
    }
  ),

  graphql.query<
    GetRecordExtractResultInfoQuery,
    GetRecordExtractResultInfoQueryVariables
  >("GetRecordExtractResultInfo", (req, res, ctx) => {
    return res(
      ctx.data({
        comments: commentRepository
          .findAll()
          .filter((c) => c.category === "extract result"),
      })
    );
  }),

  graphql.mutation<
    RecordExtractResultMutation,
    RecordExtractResultMutationVariables
  >("RecordExtractResult", (req, res, ctx) => {
    return res(
      ctx.data({
        recordExtractResult: {
          operations: [
            {
              id: 1,
            },
          ],
        },
      })
    );
  }),
];

export default extractionHandlers;
