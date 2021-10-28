import { graphql } from "msw";
import {
  ExtractResult,
  ExtractResultQueryVariables,
  PassFail,
} from "../../types/sdk";
import labwareFactory from "../../lib/factories/labwareFactory";
import { labwareTypeInstances } from "../../lib/factories/labwareTypeFactory";
import { LabwareTypeName } from "../../types/stan";

const extractionResultHandlers = [
  graphql.query<ExtractResult, ExtractResultQueryVariables>(
    "ExtractResult",
    (req, res, ctx) => {
      // Assign a labware type
      const labwareType = labwareTypeInstances.find(
        (lt) => lt.name === LabwareTypeName.TUBE
      );
      // Create the new bit of labware
      const newLabware = labwareFactory.build({
        labwareType,
      });
      newLabware.barcode = req.variables.barcode;

      return res(
        ctx.data({
          result: PassFail.Pass,
          labware: newLabware,
          concentration: "1.3",
        })
      );
      /* if (req.variables.barcode === "STAN-3111")
        return res(
          ctx.errors([
            {
              message: `Couldn't find labware with barcode ${req.variables.barcode} in sessionStorage`,
            },
          ])
        );*/
    }
  ),
];
export default extractionResultHandlers;
