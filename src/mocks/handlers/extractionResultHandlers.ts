import { graphql, HttpResponse } from 'msw';
import { ExtractResultQuery, ExtractResultQueryVariables, PassFail } from '../../types/sdk';
import labwareFactory from '../../lib/factories/labwareFactory';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../types/stan';

const extractionResultHandlers = [
  graphql.query<ExtractResultQuery, ExtractResultQueryVariables>('ExtractResult', ({ variables }) => {
    // Assign a labware type
    const labwareType = labwareTypeInstances.find((lt) => lt.name === LabwareTypeName.TUBE);
    // Create the new bit of labware
    const newLabware = labwareFactory.build({
      labwareType
    });
    newLabware.barcode = variables.barcode;

    return HttpResponse.json(
      { data: { extractResult: { result: PassFail.Pass, labware: newLabware, concentration: '1.3' } } },
      { status: 200 }
    );
  })
];
export default extractionResultHandlers;
