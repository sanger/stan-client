import { graphql } from "msw";
import {
  ConfirmMutation,
  ConfirmMutationVariables,
  PlanMutation,
  PlanMutationVariables,
} from "../../types/graphql";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";
import labwareFactory from "../../lib/factories/labwareFactory";

const planHandlers = [
  graphql.mutation<PlanMutation, PlanMutationVariables>(
    "Plan",
    (req, res, ctx) => {
      if (req.variables.request.operationType === "Section") {
        const plan: PlanMutation["plan"] = req.variables.request.labware.reduce<
          PlanMutation["plan"]
        >(
          (memo, planRequestLabware) => {
            const labwareType = labwareTypeInstances.find(
              (lt) => lt.name === planRequestLabware.labwareType
            );
            const barcode = planRequestLabware.barcode ?? undefined;
            const newLabware = labwareFactory.build({ labwareType, barcode });
            memo.labware.push(newLabware);

            const planActions: PlanMutation["plan"]["operations"][number]["planActions"] = planRequestLabware.actions.map(
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
              { operationType: { name: "Section" }, planActions: [] },
            ],
          }
        );

        return res(
          ctx.data({
            // Response not dynamic in any way. Just need a successful response for now.
            plan: {
              labware: plan.labware,
              operations: plan.operations,
              __typename: "PlanResult",
            },
          })
        );
      }
    }
  ),

  graphql.mutation<ConfirmMutation, ConfirmMutationVariables>(
    "Confirm",
    (req, res, ctx) => {
      return res(
        ctx.data({
          confirmOperation: {
            labware: [],
            operations: [],
          },
        })
      );
    }
  ),
];

export default planHandlers;
