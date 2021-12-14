import { graphql } from "msw";
import {
  FindPermDataQuery,
  FindPermDataQueryVariables,
  RecordPermMutation,
  RecordPermMutationVariables,
  Slot,
  VisiumAnalysisMutation,
  VisiumAnalysisMutationVariables,
} from "../../types/sdk";
import { createLabware } from "./labwareHandlers";
import { isSlotFilled } from "../../lib/helpers/slotHelper";
import {
  emptySlotFactory,
  filledSlotFactory,
} from "../../lib/factories/slotFactory";

const handlers = [
  graphql.mutation<RecordPermMutation, RecordPermMutationVariables>(
    "RecordPerm",
    (req, res, ctx) => {
      return res(
        ctx.data({
          recordPerm: {
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

  graphql.mutation<VisiumAnalysisMutation, VisiumAnalysisMutationVariables>(
    "VisiumAnalysis",
    (req, res, ctx) => {
      return res(
        ctx.data({
          visiumAnalysis: {
            operations: [
              {
                id: 100,
              },
            ],
          },
        })
      );
    }
  ),

  graphql.query<FindPermDataQuery, FindPermDataQueryVariables>(
    "FindPermData",
    (req, res, ctx) => {
      const barcode = req.variables.barcode;

      if (!barcode.startsWith("STAN-")) {
        return res(
          ctx.errors([
            {
              message: `Exception while fetching data (/findPermData) : No labware found with barcode: ${barcode}`,
            },
          ])
        );
      }

      const labware = createLabware(barcode);
      // Include some empty, some filled, and a few with multiple samples in
      const slots = labware.slots.map((slot, i) => {
        if (i % 2 === 1) {
          return emptySlotFactory.build({ address: slot.address });
        } else {
          return filledSlotFactory.build(
            { address: slot.address },
            { transient: { numberOfSamples: 2 } }
          );
        }
      });
      labware.slots = slots as Slot[];
      return res(
        ctx.data({
          visiumPermData: {
            labware,
            addressPermData: labware.slots
              .filter(isSlotFilled)
              .reduce<FindPermDataQuery["visiumPermData"]["addressPermData"]>(
                (memo, value, index) => {
                  if (index % 2 === 0) {
                    memo.push({
                      address: value.address,
                      selected: index === 0,
                      controlType: null,
                      seconds: (index + 1) * 60,
                    });
                    return memo;
                  }
                  return memo;
                },
                []
              ),
          },
        })
      );
    }
  ),
];

export default handlers;
