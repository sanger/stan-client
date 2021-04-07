import { graphql } from "msw";
import { uniqueId } from "lodash";
import {
  GetRegistrationInfoQuery,
  GetRegistrationInfoQueryVariables,
  RegisterSectionsMutation,
  RegisterSectionsMutationVariables,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables,
} from "../../types/graphql";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";

const registrationHandlers = [
  graphql.query<GetRegistrationInfoQuery, GetRegistrationInfoQueryVariables>(
    "GetRegistrationInfo",
    (req, res, ctx) => {
      return res(
        ctx.data({
          species: [
            { name: "Human" },
            { name: "Mouse" },
            { name: "Pig" },
            { name: "Hamster" },
          ],
          hmdmcs: [
            { hmdmc: "HMDMC1" },
            { hmdmc: "HMDMC2" },
            { hmdmc: "HMDMC3" },
            { hmdmc: "HMDMC4" },
          ],
          labwareTypes: labwareTypeInstances,
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
            clashes: [],
            labware: [
              {
                id: 1,
                barcode: "LW_BC_1",
                released: false,
                discarded: false,
                destroyed: false,
                labwareType: {
                  name: "Proviasette",
                  numRows: 1,
                  numColumns: 1,
                  labelType: {
                    name: "Label Type 1",
                  },
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
                        bioState: { name: "Tissue" },
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

  graphql.mutation<RegisterSectionsMutation, RegisterSectionsMutationVariables>(
    "RegisterSections",
    (req, res, ctx) => {
      return res(
        ctx.data({
          registerSections: {
            labware: req.variables.request.labware.map((labware) => {
              let labwareId = parseInt(uniqueId());
              return {
                id: labwareId,
                released: false,
                discarded: false,
                destroyed: false,
                labwareType: {
                  name: labware.labwareType,
                  // numRows and numColumns not correct but don't need to be for this particular mock
                  numRows: 1,
                  numColumns: 1,
                },
                barcode: labware.externalBarcode,
                slots: labware.contents.map((content) => ({
                  labwareId,
                  address: content.address,
                  samples: [
                    {
                      id: parseInt(uniqueId()),
                      tissue: {
                        spatialLocation: {
                          code: content.spatialLocation,
                          tissueType: {
                            name: content.tissueType,
                          },
                        },
                        externalName: content.externalIdentifier,
                        replicate: content.replicateNumber,
                        donor: {
                          donorName: content.donorIdentifier,
                        },
                      },
                      bioState: { name: "Tissue" },
                    },
                  ],
                })),
              };
            }),
          },
        })
      );
    }
  ),
];

export default registrationHandlers;
