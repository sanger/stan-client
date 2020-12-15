import { graphql } from "msw";
import {
  CurrentUserQuery,
  CurrentUserQueryVariables,
  FindLabwareQuery,
  FindLabwareQueryVariables,
  GetPrintersQuery,
  GetPrintersQueryVariables,
  GetRegistrationInfoQuery,
  GetRegistrationInfoQueryVariables,
  GetSectioningInfoQuery,
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
                barcode: "LW_BC_1",
                labwareType: {
                  name: "Proviasette",
                },
                slots: [
                  {
                    samples: [
                      {
                        tissue: {
                          externalName: "EXTERNAL_123",
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

      return res(
        ctx.data({
          labware: {
            labwareType: {
              name: "Proviasette",
            },
            barcode: req.variables.barcode,
            slots: [
              {
                block: true,
                address: "A1",
                samples: [
                  {
                    id: 3,
                    tissue: {
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
        })
      );
    }
  ),

  graphql.query<GetSectioningInfoQuery, GetRegistrationInfoQueryVariables>(
    "GetSectioningInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          labwareTypes: labwareTypeInstances,
        })
      );
    }
  ),

  // graphql.mutation<PlanMutation, PlanMutationVariables>(
  //   "Plan",
  //   (req, res, ctx) => {
  //     if (req.variables.request.operationType === "Section") {
  //       return res(
  //         ctx.data({
  //           // Response not dynamic in any way. Just need a successful response for now.
  //           plan: {
  //             labware: [
  //               {
  //                 id: 53,
  //                 barcode: "STAN-002FB",
  //                 slots: [
  //                   {
  //                     samples: [],
  //                     address: "A1",
  //                     __typename: "Slot",
  //                   },
  //                   {
  //                     samples: [],
  //                     address: "B1",
  //                     __typename: "Slot",
  //                   },
  //                   {
  //                     samples: [],
  //                     address: "C1",
  //                     __typename: "Slot",
  //                   },
  //                   {
  //                     samples: [],
  //                     address: "A2",
  //                     __typename: "Slot",
  //                   },
  //                   {
  //                     samples: [],
  //                     address: "B2",
  //                     __typename: "Slot",
  //                   },
  //                   {
  //                     samples: [],
  //                     address: "C2",
  //                     __typename: "Slot",
  //                   },
  //                 ],
  //                 labwareType: {
  //                   name: "slide",
  //                   numRows: 3,
  //                   numColumns: 2,
  //                   __typename: "LabwareType",
  //                 },
  //                 __typename: "Labware",
  //               },
  //             ],
  //             operations: [
  //               {
  //                 operationType: {
  //                   name: "Section",
  //                   __typename: "OperationType",
  //                 },
  //                 planActions: [
  //                   {
  //                     newSection: 177,
  //                     sample: {
  //                       id: 1,
  //                     },
  //                     source: {
  //                       address: "A1",
  //                       __typename: "Slot",
  //                     },
  //                     destination: {
  //                       address: "A1",
  //                       labwareId: 53,
  //                       __typename: "Slot",
  //                     },
  //                     __typename: "PlanAction",
  //                   },
  //                   {
  //                     newSection: 178,
  //                     sample: {
  //                       id: 1,
  //                     },
  //                     source: {
  //                       address: "A1",
  //                       __typename: "Slot",
  //                     },
  //                     destination: {
  //                       address: "B1",
  //                       labwareId: 53,
  //                       __typename: "Slot",
  //                     },
  //                     __typename: "PlanAction",
  //                   },
  //                   {
  //                     newSection: 179,
  //                     sample: {
  //                       id: 1,
  //                     },
  //                     source: {
  //                       address: "A1",
  //                       __typename: "Slot",
  //                     },
  //                     destination: {
  //                       address: "C1",
  //                       labwareId: 53,
  //                       __typename: "Slot",
  //                     },
  //                     __typename: "PlanAction",
  //                   },
  //                   {
  //                     newSection: 180,
  //                     sample: {
  //                       id: 1,
  //                     },
  //                     source: {
  //                       address: "A1",
  //                       __typename: "Slot",
  //                     },
  //                     destination: {
  //                       address: "A2",
  //                       labwareId: 53,
  //                       __typename: "Slot",
  //                     },
  //                     __typename: "PlanAction",
  //                   },
  //                   {
  //                     newSection: 181,
  //                     sample: {
  //                       id: 1,
  //                     },
  //                     source: {
  //                       address: "A1",
  //                       __typename: "Slot",
  //                     },
  //                     destination: {
  //                       address: "B2",
  //                       labwareId: 53,
  //                       __typename: "Slot",
  //                     },
  //                     __typename: "PlanAction",
  //                   },
  //                   {
  //                     newSection: 182,
  //                     sample: {
  //                       id: 1,
  //                     },
  //                     source: {
  //                       address: "A1",
  //                       __typename: "Slot",
  //                     },
  //                     destination: {
  //                       address: "B3",
  //                       labwareId: 53,
  //                       __typename: "Slot",
  //                     },
  //                     __typename: "PlanAction",
  //                   },
  //                 ],
  //                 __typename: "PlanOperation",
  //               },
  //             ],
  //             __typename: "PlanResult",
  //           },
  //         })
  //       );
  //     }
  //   }
  // ),

  graphql.query<GetPrintersQuery, GetPrintersQueryVariables>(
    "GetPrinters",
    (req, res, ctx) => {
      return res(
        ctx.data({
          printers: [
            {
              __typename: "Printer",
              name: "cgaptestbc",
              labelType: {
                name: "tiny",
              },
            },
            {
              __typename: "Printer",
              name: "slidelabel",
              labelType: {
                name: "label",
              },
            },
          ],
        })
      );
    }
  ),

  graphql.mutation<PrintMutation, PrintMutationVariables>(
    "Print",
    (req, res, ctx) => {
      // Just so we can test failure behaviour
      if (req.variables.printer === "slidelabel") {
        return res(
          ctx.errors([
            {
              message: "Failed to print",
            },
          ])
        );
      }

      return res(
        ctx.data({
          printLabware: "OK",
        })
      );
    }
  ),
];
