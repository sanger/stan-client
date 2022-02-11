import { graphql } from "msw";
import { FindLabwareQuery, FindLabwareQueryVariables } from "../../types/sdk";
import labwareFactory from "../../lib/factories/labwareFactory";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";
import { buildLabwareFragment } from "../../lib/helpers/labwareHelper";

export function createLabware(barcode: string) {
  // The number after STAN- determines what kind of labware will be returned
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

  sessionStorage.setItem(`labware-${labware.barcode}`, JSON.stringify(labware));

  return labware;
}

const labwareHandlers = [
  graphql.query<FindLabwareQuery, FindLabwareQueryVariables>(
    "FindLabware",
    (req, res, ctx) => {
      const barcode = req.variables.barcode;

      if (!barcode.startsWith("STAN-")) {
        return res(
          ctx.errors([
            {
              message: `Exception while fetching data (/labware) : No labware found with barcode: ${barcode}`,
            },
          ])
        );
      }

      const labware = createLabware(barcode);
      const payload: FindLabwareQuery = {
        labware: buildLabwareFragment(labware),
      };

      return res(ctx.data(payload));
    }
  ),
];

export default labwareHandlers;
