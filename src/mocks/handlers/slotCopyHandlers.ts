import { SlotCopyMutation, SlotCopyMutationVariables } from '../../types/sdk';
import { graphql } from 'msw';
import labwareFactory from '../../lib/factories/labwareFactory';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import { buildLabwareFragment } from '../../lib/helpers/labwareHelper';
import { find } from 'lodash';

const slotCopyHandlers = [
  graphql.mutation<SlotCopyMutation, SlotCopyMutationVariables>('SlotCopy', (req, res, ctx) => {
    const newLabware = labwareFactory.build(undefined, {
      associations: {
        labwareType: find(labwareTypeInstances, {
          name: req.variables.request.labwareType
        })
      }
    });

    const payload: SlotCopyMutation = {
      __typename: 'Mutation',
      slotCopy: {
        __typename: 'OperationResult',
        labware: [buildLabwareFragment(newLabware)]
      }
    };

    return res(ctx.data(payload));
  })
];

export default slotCopyHandlers;
