import {
  ReloadSlotCopyQuery,
  ReloadSlotCopyQueryVariables,
  SaveSlotCopyMutation,
  SaveSlotCopyMutationVariables,
  SlideCosting,
  SlotCopyLoad,
  SlotCopyMutation,
  SlotCopyMutationVariables
} from '../../types/sdk';
import { graphql, HttpResponse } from 'msw';
import labwareFactory from '../../lib/factories/labwareFactory';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import { buildLabwareFragment } from '../../lib/helpers/labwareHelper';
import { find } from 'lodash';
import { LabwareTypeName } from '../../types/stan';

const savedSlotCopy: SlotCopyLoad = {
  operationType: 'CyAssist',
  workNumber: 'SGP1',
  lpNumber: 'LP1',
  labwareType: LabwareTypeName.VISIUM_LP_CYTASSIST,
  preBarcode: 'H1-9D8VN2V',
  probeLotNumber: '123456',
  lotNumber: '7712543',
  costing: SlideCosting.Sgp,
  sources: [],
  contents: [
    {
      sourceBarcode: 'STAN-3100',
      sourceAddress: 'A1',
      destinationAddress: 'A1'
    },
    {
      sourceBarcode: 'STAN-3100',
      sourceAddress: 'B1',
      destinationAddress: 'A1'
    },
    {
      sourceBarcode: 'STAN-3200',
      sourceAddress: 'A2',
      destinationAddress: 'D1'
    }
  ]
};

const slotCopyHandlers = [
  graphql.mutation<SlotCopyMutation, SlotCopyMutationVariables>('SlotCopy', ({ variables }) => {
    let newLabwareArr = variables.request.destinations.map((dest) =>
      labwareFactory.build(undefined, {
        associations: {
          labwareType: find(labwareTypeInstances, {
            name: dest.labwareType!
          })
        }
      })
    );

    const payload: SlotCopyMutation = {
      __typename: 'Mutation',
      slotCopy: {
        __typename: 'OperationResult',
        labware: newLabwareArr.map((labware) => buildLabwareFragment(labware))
      }
    };
    return HttpResponse.json({ data: payload }, { status: 200 });
  }),

  graphql.mutation<SaveSlotCopyMutation, SaveSlotCopyMutationVariables>('SaveSlotCopy', ({ variables }) => {
    const payload: SaveSlotCopyMutation = {
      __typename: 'Mutation',
      saveSlotCopy: savedSlotCopy
    };
    return HttpResponse.json({ data: payload }, { status: 200 });
  }),

  graphql.query<ReloadSlotCopyQuery, ReloadSlotCopyQueryVariables>('ReloadSlotCopy', ({ variables }) => {
    return HttpResponse.json({
      data: {
        reloadSlotCopy: {
          ...savedSlotCopy,
          workNumber: variables.workNumber,
          lpNumber: variables.lpNumber
        }
      }
    });
  })
];

export default slotCopyHandlers;
