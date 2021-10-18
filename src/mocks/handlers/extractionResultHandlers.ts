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
      /*  throw new Error(
          `Couldn't find labware with barcode ${req.variables.barcode} in sessionStorage`
        );
      */

      // Assign a labware type
      const labwareType = labwareTypeInstances.find(
        (lt) => lt.name === LabwareTypeName.TUBE
      );
      // Create the new bit of destination labware using the same slots and samples as the source
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
    }
  ),
];
export default extractionResultHandlers;
