import { graphql, HttpResponse } from 'msw';
import {
  AddProteinPanelMutation,
  AddProteinPanelMutationVariables,
  GetProteinPanelsQuery,
  GetProteinPanelsQueryVariables,
  SetProteinPanelEnabledMutation,
  SetProteinPanelEnabledMutationVariables
} from '../../types/sdk';
import proteinPanelFactory from '../../lib/factories/ProteinPanelFactory';
import proteinPanelRepository from '../repositories/proteinPanelRepository';

const proteinPanelHandlers = [
  graphql.query<GetProteinPanelsQuery, GetProteinPanelsQueryVariables>('GetProteinPanels', ({ variables }) => {
    const proteinPanels = proteinPanelRepository.findAll();
    return HttpResponse.json({ data: { proteinPanels } }, { status: 200 });
  }),
  graphql.mutation<AddProteinPanelMutation, AddProteinPanelMutationVariables>('AddProteinPanel', ({ variables }) => {
    const addProteinPanel = proteinPanelFactory.build({ name: variables.name });
    proteinPanelRepository.save(addProteinPanel);
    return HttpResponse.json({ data: { addProteinPanel } }, { status: 200 });
  }),

  graphql.mutation<SetProteinPanelEnabledMutation, SetProteinPanelEnabledMutationVariables>(
    'SetProteinPanelEnabled',
    ({ variables }) => {
      const proteinPanel = proteinPanelRepository.find('name', variables.name);
      if (proteinPanel) {
        proteinPanel.enabled = variables.enabled;
        proteinPanelRepository.save(proteinPanel);
        return HttpResponse.json({ data: { setProteinPanelEnabled: proteinPanel } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find Protein panel: "${variables.name}"` }] },
          { status: 404 }
        );
      }
    }
  )
];

export default proteinPanelHandlers;
