import { SlotCopyMutation, SlotCopyMutationVariables } from '../../types/sdk';
import { graphql, HttpResponse } from 'msw';
import labwareFactory from '../../lib/factories/labwareFactory';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import { buildLabwareFragment } from '../../lib/helpers/labwareHelper';
import { find } from 'lodash';

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
  })
];

export default slotCopyHandlers;
