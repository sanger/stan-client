import { graphql } from "msw";
import {
  ConfirmMutation,
  ConfirmMutationVariables,
  CurrentUserQuery,
  CurrentUserQueryVariables,
  FindLabwareQuery,
  FindLabwareQueryVariables,
  GetPrintersQuery,
  GetPrintersQueryVariables,
  GetRegistrationInfoQuery,
  GetRegistrationInfoQueryVariables,
  GetSectioningInfoQuery,
  LifeStage,
  LoginMutation,
  LoginMutationVariables,
  LogoutMutation,
  LogoutMutationVariables,
  PlanMutation,
  PlanMutationVariables,
  PrintMutation,
  PrintMutationVariables,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
} from "../types/graphql";
import { labwareTypeInstances } from "../lib/factories/labwareTypeFactory";
import labwareFactory from "../lib/factories/labwareFactory";

const CURRENT_USER_KEY = "currentUser";
/**
 * Default handlers for the mock API
 */
export const handlers = [
  graphql.mutation<LoginMutation, LoginMutationVariables>(
    "Login",
    (req, res, ctx) => {
      const { username } = req.variables;
      sessionStorage.setItem(CURRENT_USER_KEY, username);
      return res(
        ctx.data({
          login: {
            user: {
              username,
            },
          },
        })
      );
    }
  ),

  graphql.mutation<LogoutMutation, LogoutMutationVariables>(
    "Logout",
    (req, res, ctx) => {
      sessionStorage.removeItem(CURRENT_USER_KEY);
      return res(
        ctx.data({
          logout: "OK",
        })
      );
    }
  ),

  graphql.query<CurrentUserQuery, CurrentUserQueryVariables>(
    "CurrentUser",
    (req, res, ctx) => {
      const currentUser = sessionStorage.getItem(CURRENT_USER_KEY);

      // By default we want the user to be logged in.
      // If this is the first request, currentUser won't be set yet.
      if (!currentUser) {
        sessionStorage.setItem(CURRENT_USER_KEY, "jb1");
        return res(
          ctx.data({
            user: {
              username: "jb1",
            },
          })
        );
      } else {
        return res(
          ctx.data({
            user: {
              username: currentUser,
            },
          })
        );
      }
    }
  ),

  graphql.query<GetRegistrationInfoQuery, GetRegistrationInfoQueryVariables>(
    "GetRegistrationInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          hmdmcs: [
            { hmdmc: "HMDMC1" },
            { hmdmc: "HMDMC2" },
            { hmdmc: "HMDMC3" },
            { hmdmc: "HMDMC4" },
          ],
          labwareTypes: [
            {
              name: "Proviasette",
            },
          ],
          tissueTypes: [
            {
              name: "Liver",
              spatialLocations: [
                {
                  name: "Not specified",
                  code: 0,
                },
                {
                  name: "Liver segments IV (left lobe)",
                  code: 1,
                },
                {
                  name: "Surface cranial region",
                  code: 2,
                },
                {
                  name: "Surface central region",
                  code: 3,
                },
                {
                  name: "Surface caudal region",
                  code: 4,
                },
                {
                  name: "Deep parenchymal central region (towards hilum)",
                  code: 5,
                },
                {
                  name: "Right lobe (fine needle aspiration samples)",
                  code: 6,
                },
              ],
            },
            {
              name: "Kidney",
              spatialLocations: [
                {
                  name: "Not specified",
                  code: 0,
                },
                {
                  name: "Cortex",
                  code: 1,
                },
                {
                  name: "Medulla at equator",
                  code: 2,
                },
                {
                  name: "Pelvis at equator",
                  code: 3,
                },
                {
                  name: "Upper pole",
                  code: 4,
                },
                {
                  name: "Lower pole",
                  code: 5,
                },
              ],
            },
          ],
          fixatives: [{ name: "None" }, { name: "Formalin" }],
          mediums: [{ name: "OCT" }, { name: "Paraffin" }, { name: "None" }],
          mouldSizes: [
            {
              name: "10x10",
            },
            {
              name: "15x15",
            },
            {
              name: "30x24",
            },
          ],
        })
      );
    }
  ),

  graphql.mutation<RegisterTissuesMutation, RegisterTissuesMutationVariables>(
    "RegisterTissues",
    (req, res, ctx) => {
      return res(
        ctx.data({
          register: {
            labware: [
              {
                id: 1,
                barcode: "LW_BC_1",
                labwareType: {
                  name: "Proviasette",
                  numRows: 1,
                  numColumns: 1,
                },
                slots: [
                  {
                    address: "A1",
                    labwareId: 1,
                    samples: [
                      {
                        id: 1,
                        tissue: {
                          externalName: "EXT1",
                          replicate: 5,
                          donor: {
                            donorName: "Donor 3",
                          },
                          spatialLocation: {
                            code: 3,
                            tissueType: {
                              name: "Lung",
                            },
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        })
      );
    }
  ),

  graphql.query<FindLabwareQuery, FindLabwareQueryVariables>(
    "FindLabware",
    (req, res, ctx) => {
      if (!req.variables.barcode.startsWith("STAN-")) {
        return res(
          ctx.errors([
            {
              message: `Exception while fetching data (/labware) : No labware found with barcode: ${req.variables.barcode}`,
            },
          ])
        );
      }

      const labware = labwareFactory.build({
        labwareType: {
          name: "Proviasette",
          labelType: {
            name: "tiny",
          },
        },
        barcode: req.variables.barcode,
        slots: [
          {
            block: true,
            address: "A1",
            labwareId: 3,
            samples: [
              {
                id: 3,
                tissue: {
                  replicate: 5,
                  externalName: "EXT 1",
                  hmdmc: {
                    hmdmc: "HMDMC",
                  },
                  mouldSize: {
                    name: "hUGe",
                  },
                  medium: {
                    name: "Slime",
                  },
                  fixative: {
                    name: "Wax",
                  },
                  donor: {
                    lifeStage: LifeStage.Fetal,
                    donorName: "Donor 3",
                  },
                  spatialLocation: {
                    name: "Somewhere",
                    code: 3,
                    tissueType: {
                      spatialLocations: [],
                      name: "Lung",
                    },
                  },
                },
              },
            ],
          },
        ],
      });

      sessionStorage.setItem(
        `labware-${labware.barcode}`,
        JSON.stringify(labware)
      );

      return res(
        ctx.data({
          labware,
        })
      );
    }
  ),

  graphql.query<GetSectioningInfoQuery, GetRegistrationInfoQueryVariables>(
    "GetSectioningInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          comments: [
            {
              id: 1,
              text: "Section Folded",
              category: "section",
            },
            {
              id: 2,
              text: "Poor section quality",
              category: "section",
            },
            {
              id: 3,
              text: "Sectioned well",
              category: "section",
            },
            {
              id: 4,
              text: "Section exploded",
              category: "section",
            },
          ],
          labwareTypes: labwareTypeInstances,
        })
      );
    }
  ),

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

  graphql.query<GetPrintersQuery, GetPrintersQueryVariables>(
    "GetPrinters",
    (req, res, ctx) => {
      return res(
        ctx.data({
          printers: labwareTypeInstances.reduce<GetPrintersQuery["printers"]>(
            (memo, labwareType) => {
              if (labwareType.labelType?.name) {
                memo.push({
                  labelType: {
                    name: labwareType.labelType.name,
                  },
                  name: `${labwareType.name} Printer`,
                });
              }
              return memo;
            },
            []
          ),
        })
      );
    }
  ),

  graphql.mutation<PrintMutation, PrintMutationVariables>(
    "Print",
    (req, res, ctx) => {
      return res(
        ctx.data({
          printLabware: "OK",
        })
      );
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
