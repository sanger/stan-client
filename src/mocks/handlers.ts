import { graphql } from "msw";
import {
  FindLabwareQuery,
  GetRegistrationInfoQuery,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
} from "../types/graphql";

const CURRENT_USER_KEY = "currentUser";
/**
 * Default handlers for the mock API
 */
export const handlers = [
  graphql.mutation("Login", (req, res, ctx) => {
    const { username } = req.variables;
    sessionStorage.setItem(CURRENT_USER_KEY, username);
    return res(
      ctx.data({
        login: {
          message: "OK",
          user: {
            username,
          },
        },
      })
    );
  }),

  graphql.mutation("Logout", (req, res, ctx) => {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    return res(
      ctx.data({
        logout: "OK",
      })
    );
  }),

  graphql.query("CurrentUser", (req, res, ctx) => {
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
  }),

  graphql.query<GetRegistrationInfoQuery>(
    "GetRegistrationInfo",
    (req, res, ctx) => {
      // return res(ctx.errors([{ message: "There was an error!" }]));
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

  graphql.query<FindLabwareQuery>("FindLabware", (req, res, ctx) => {
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
              address: {
                row: 1,
                column: 1,
              },
              samples: [
                {
                  section: 1,
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
  }),
];
