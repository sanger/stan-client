import { graphql } from "msw";
import {
  FindLabwareQuery,
  FindLabwareQueryVariables,
  LifeStage,
} from "../../types/graphql";
import labwareFactory from "../../lib/factories/labwareFactory";

const labwareHandlers = [
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
];

export default labwareHandlers;
