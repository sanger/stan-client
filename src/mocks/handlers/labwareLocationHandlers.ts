import { graphql } from "msw";
import {
  GetLabwareInLocationQuery,
  GetLabwareInLocationQueryVariables,
  Labware,
} from "../../types/sdk";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";
import labwareFactory from "../../lib/factories/labwareFactory";
import { buildLabwareFragment } from "../../lib/helpers/labwareHelper";

const createLabware = (barcode: string): Labware => {
  const magicNumber = parseInt(barcode.substr(5, 1));
  const labwareType =
    labwareTypeInstances[magicNumber % labwareTypeInstances.length];
  // The number after that determines how many samples to put in each slot
  const samplesPerSlot = parseInt(barcode.substr(6, 1));

  const labware = labwareFactory.build(
    {
      barcode: barcode,
    },
    {
      transient: {
        samplesPerSlot,
      },
      associations: {
        labwareType,
      },
    }
  );
  return labware;
};
const labwareLocationHandlers = [
  graphql.query<GetLabwareInLocationQuery, GetLabwareInLocationQueryVariables>(
    "GetLabwaresInLocation",
    (req, res, ctx) => {
      // The number after STAN- determines what kind of labware will be returned

      const labwaresBarcodes: string[] = [
        "STAN-3111",
        "STAN-3112",
        "STAN-3113",
      ];
      const labwares = labwaresBarcodes.map((barcode) => {
        const labware = createLabware(barcode);
        sessionStorage.setItem(
          `labware-${labware.barcode}`,
          JSON.stringify(labware)
        );
        return buildLabwareFragment(labware);
      });

      const payload: GetLabwareInLocationQuery = {
        labwareInLocation: labwares,
      };

      return res(ctx.data(payload));
    }
  ),
];
