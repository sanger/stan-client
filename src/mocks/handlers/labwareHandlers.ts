import { graphql, HttpResponse } from 'msw';
import {
  FindLabwareQuery,
  FindLabwareQueryVariables,
  FindLatestOperationQuery,
  FindLatestOperationQueryVariables,
  GetLabwareOperationsQuery,
  GetLabwareOperationsQueryVariables,
  GetSuggestedWorkForLabwareQuery,
  GetSuggestedWorkForLabwareQueryVariables,
  Labware,
  UserRole
} from '../../types/sdk';
import labwareFactory from '../../lib/factories/labwareFactory';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import { buildLabwareFragment } from '../../lib/helpers/labwareHelper';
import workFactory from '../../lib/factories/workFactory';
import { DeepPartial } from 'fishery';

export function createLabware(barcode: string) {
  // The number after STAN- determines what kind of labware will be returned
  const magicNumber = parseInt(barcode.substring(5, 6));
  const labwareType = labwareTypeInstances[magicNumber % labwareTypeInstances.length];
  // The number after that determines how many samples to put in each slot
  const samplesPerSlot = parseInt(barcode.substring(6, 7));
  const id = generateLabwareIdFromBarcode(barcode);
  const params =
    id < 0
      ? { barcode: barcode }
      : {
          barcode: barcode,
          id: id
        };
  const labware = labwareFactory.build(params, {
    transient: {
      samplesPerSlot
    },
    associations: {
      labwareType
    }
  });

  sessionStorage.setItem(`labware-${labware.barcode}`, JSON.stringify(labware));
  return labware;
}

export function createLabwareFromParams(params: DeepPartial<Labware>) {
  const labware = labwareFactory.build(params);
  sessionStorage.setItem(`labware-${labware.barcode}`, JSON.stringify(labware));
  return labware;
}

/**This function generates an id which is equivalent to the number part in barcode
 * The intention is not to generate a unique id , but useful in scenarios which requires
 * comparison against a predictable id rather than having completely random one
 * @param barcode
 */
export function generateLabwareIdFromBarcode(barcode: string) {
  const numPartInBarcode = barcode.replace(/\D/g, '');
  return Number.parseInt(numPartInBarcode);
}

const labwareHandlers = [
  graphql.query<FindLabwareQuery, FindLabwareQueryVariables>('FindLabware', ({ variables }) => {
    const barcode = variables.barcode;

    if (!barcode.startsWith('STAN-')) {
      return HttpResponse.json(
        {
          errors: [{ message: `Exception while fetching data (/labware) : No labware found with barcode: ${barcode}` }]
        },
        { status: 400 }
      );
    }
    const labwareJson = sessionStorage.getItem(`labware-${barcode}`);
    const labware: Labware = labwareJson ? JSON.parse(labwareJson) : createLabware(barcode);
    const payload: FindLabwareQuery = {
      labware: buildLabwareFragment(labware)
    };
    return HttpResponse.json({ data: payload }, { status: 200 });
  }),

  graphql.query<GetLabwareOperationsQuery, GetLabwareOperationsQueryVariables>(
    'GetLabwareOperations',
    ({ variables }) => {
      const optype = variables.operationType;

      return HttpResponse.json({
        data: {
          labwareOperations: [
            {
              id: 1,
              operationType: {
                name: optype
              },
              actions: [],
              user: {
                username: 'test',
                role: UserRole.Normal
              },
              performed: ''
            }
          ]
        }
      });
    }
  ),

  graphql.query<GetSuggestedWorkForLabwareQuery, GetSuggestedWorkForLabwareQueryVariables>(
    'GetSuggestedWorkForLabware',
    ({ variables }) => {
      const work = workFactory.build({ workNumber: 'SGP1008' });

      return HttpResponse.json({
        data: {
          suggestedWorkForLabware: {
            suggestedWorks: [...variables.barcodes].map((barcode) => ({
              workNumber: work.workNumber,
              barcode: barcode
            }))
          }
        }
      });
    }
  ),

  graphql.query<FindLatestOperationQuery, FindLatestOperationQueryVariables>('FindLatestOperation', () => {
    return HttpResponse.json({ data: { findLatestOp: { id: 1 } } });
  })
];

export default labwareHandlers;
