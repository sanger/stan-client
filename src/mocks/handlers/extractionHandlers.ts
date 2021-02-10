import { graphql } from "msw";
import { ExtractMutation, ExtractMutationVariables } from "../../types/graphql";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";
import labwareFactory from "../../lib/factories/labwareFactory";

const extractionHandlers = [
  graphql.mutation<ExtractMutation, ExtractMutationVariables>(
    "Extract",
    (req, res, ctx) => {
      // return res(
      //   ctx.errors([
      //     {
      //       message: `Exception while fetching data (/release) : Your labwares are haunted`,
      //     },
      //   ])
      // );

      if (req.variables.request.operationType === "Extract") {
        const plan: ExtractMutation["extract"] = req.variables.request.labware.reduce<
          ExtractMutation["extract"]
        >(
          (memo, planRequestLabware) => {
            const planActions: ExtractMutation["extract"]["operations"][number]["planActions"] = planRequestLabware.actions.map(
              (planAction) => {
                const labwareJson = sessionStorage.getItem(
                  `labware-${planAction.source.barcode}`
                );

                if (!labwareJson) {
                  throw new Error(
                    `Couldn't find labware with barcode ${planAction.source.barcode} in sessionStorage`
                  );
                }

                const labware = JSON.parse(labwareJson);

                const labwareType = labwareTypeInstances.find(
                  (lt) => lt.name === planRequestLabware.labwareType
                );
                const barcode = planRequestLabware.barcode ?? undefined;
                const newLabware = labwareFactory.build({
                  labwareType,
                  barcode,
                  slots: labware.slots,
                });
                memo.labware.push(newLabware);

                return {
                  newSection: undefined,
                  sample: {
                    id: planAction.sampleId,
                  },
                  source: {
                    address: planAction.address,
                    labwareId: labware.id,
                    samples: [
                      {
                        id: planAction.sampleId,
                      },
                    ],
                  },
                  destination: {
                    address: planAction.address,
                    labwareId: newLabware.id,
                  },
                };
              }
            );

            memo.operations[0].planActions = [
              ...memo.operations[0].planActions,
              ...planActions,
            ];

            return memo;
          },
          {
            labware: [],
            operations: [
              { operationType: { name: "Extract" }, planActions: [] },
            ],
          }
        );

        return res(
          ctx.data({
            extract: {
              labware: plan.labware,
              operations: plan.operations,
            },
          })
        );
      }
    }
  ),
];

export default extractionHandlers;
