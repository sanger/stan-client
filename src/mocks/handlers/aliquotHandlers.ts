import { graphql } from 'msw';
import { AliquotMutation, AliquotMutationVariables } from '../../types/sdk';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import labwareFactory from '../../lib/factories/labwareFactory';

const aliquotHandlers = [
  graphql.mutation<AliquotMutation, AliquotMutationVariables>('Aliquot', (req, res, ctx) => {
    const barcode = req.variables.request.barcode;
    const labwareJson = sessionStorage.getItem(`labware-${barcode}`);
    if (!labwareJson) {
      throw new Error(`Couldn't find labware with barcode ${barcode} in sessionStorage`);
    }

    const aliquot: AliquotMutation['aliquot'] = {
      labware: [],
      operations: [{ operationType: { name: 'Aliquot' }, actions: [] }]
    };

    // Parse it
    const labware = JSON.parse(labwareJson);

    // Find the requested labware type by name
    const labwareType = labwareTypeInstances.find((lt) => lt.name === req.variables.request.labwareType);

    //Create as many destination labwares as required
    for (let indx = 0; indx < req.variables.request.numLabware; indx++) {
      // Create the new bit of destination labware using the same slots and samples as the source

      const newLabware = labwareFactory.build({
        barcode: `STAN-100${indx + 1}`, //assign fixed barcodes to conduct more reliable test cases
        labwareType,
        slots: labware.slots
      });

      aliquot.labware.push(newLabware);
      let action = {
        sample: {
          id: labware.slots[0].samples[0].sampleId
        },
        source: {
          address: 'A1',
          labwareId: labware.id,
          samples: [
            {
              id: labware.slots[0].samples[0].sampleId
            }
          ]
        },
        destination: {
          address: 'A1',
          labwareId: newLabware.id
        }
      };
      aliquot.operations[0].actions.push(action);
    }
    return res(
      ctx.data({
        aliquot: {
          labware: aliquot.labware,
          operations: aliquot.operations
        }
      })
    );
  })
];

export default aliquotHandlers;
