import { graphql, HttpResponse } from 'msw';
import { GetRegionsOfInterestQuery, GetRegionsOfInterestQueryVariables, LabwareRoi } from '../../types/sdk';
import { createLabware } from './labwareHandlers';
import { faker } from '@faker-js/faker';

const regionOfInterestHandlers = [
  graphql.query<GetRegionsOfInterestQuery, GetRegionsOfInterestQueryVariables>(
    'GetRegionsOfInterest',
    ({ variables }) => {
      const barcodes = Array.isArray(variables.barcodes) ? variables.barcodes : [variables.barcodes];
      const regionsOfInterests: LabwareRoi[] = [];
      barcodes.forEach((barcode) => {
        const labware = createLabware(barcode);
        const regionsOfInterest: LabwareRoi = {
          barcode: labware.barcode,
          rois: labware.slots.flatMap((slot) =>
            slot.samples.map((sample) => ({
              sampleId: sample.id,
              address: slot.address,
              roi: faker.helpers.arrayElement(['top left', 'top right', 'bottom left', 'bottom right', 'center'])
            }))
          )
        };
        regionsOfInterests.push(regionsOfInterest);
      });
      return HttpResponse.json({ data: { rois: regionsOfInterests } }, { status: 200 });
    }
  )
];

export default regionOfInterestHandlers;
