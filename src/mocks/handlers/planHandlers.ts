import { graphql, GraphQLContext } from "msw";
import {
  ConfirmMutation,
  ConfirmMutationVariables,
  FindPlanDataQuery,
  FindPlanDataQueryVariables,
  Labware,
  PlanMutation,
  PlanMutationVariables,
} from "../../types/sdk";
import {
  labwareTypeInstances,
  labwareTypes,
} from "../../lib/factories/labwareTypeFactory";
import labwareFactory from "../../lib/factories/labwareFactory";
import { uniqueId } from "lodash";
import { buildLabwareFragment } from "../../lib/helpers/labwareHelper";
import { LabwareTypeName } from "../../types/stan";
import { generateLabwareIdFromBarcode } from "./labwareHandlers";

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
                  newSection: parseInt(uniqueId()),
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

  graphql.query<FindPlanDataQuery, FindPlanDataQueryVariables>(
    "FindPlanData",
    (req, res, ctx) => {
      const sourceLabware = labwareFactory.build(
        { barcode: "STAN-2021" },
        {
          associations: {
            labwareType: labwareTypes[LabwareTypeName.PROVIASETTE].build(),
          },
        }
      );
      const destinationLabware = labwareFactory.build(
        {
          barcode: req.variables.barcode,
          id: generateLabwareIdFromBarcode(req.variables.barcode),
        },
        {
          associations: {
            labwareType: labwareTypes[LabwareTypeName.SLIDE].build(),
          },
        }
      );

      return res(findPlanData(sourceLabware, destinationLabware, ctx));
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

export function findPlanData(
  sourceLabware: Labware,
  destinationLabware: Labware,
  ctx: GraphQLContext<FindPlanDataQuery>
) {
  return ctx.data({
    planData: {
      sources: [buildLabwareFragment(sourceLabware)],
      destination: buildLabwareFragment(destinationLabware),
      plan: {
        operationType: {
          __typename: "OperationType",
          name: "Section",
        },
        planActions: [
          {
            __typename: "PlanAction",
            source: {
              __typename: "Slot",
              address: "A1",
              samples: [
                {
                  __typename: "Sample",
                  id: sourceLabware.slots[0].samples[0].id,
                },
              ],
              labwareId: sourceLabware.id,
            },
            destination: {
              __typename: "Slot",
              labwareId: destinationLabware.id,
              address: "A1",
            },
            sample: {
              __typename: "Sample",
              id: sourceLabware.slots[0].samples[0].id,
            },
          },
        ],
      },
    },
  });
}

export default planHandlers;
