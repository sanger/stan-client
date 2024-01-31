import { graphql, HttpResponse } from 'msw';
import {
  AddProbePanelMutation,
  AddProbePanelMutationVariables,
  GetProbePanelsQuery,
  GetProbePanelsQueryVariables,
  SetProbePanelEnabledMutation,
  SetProbePanelEnabledMutationVariables
} from '../../types/sdk';
import probePanelRepository from '../repositories/probePanelRepository';
import probePanelFactory from '../../lib/factories/probePanelFactory';

const probePanelHandlers = [
  graphql.query<GetProbePanelsQuery, GetProbePanelsQueryVariables>('GetProbePanels', () => {
    return HttpResponse.json({ data: { probePanels: probePanelRepository.findAll() } }, { status: 200 });
  }),
  graphql.mutation<AddProbePanelMutation, AddProbePanelMutationVariables>('AddProbePanel', ({ variables }) => {
    const addProbePanel = probePanelFactory.build({ name: variables.name });
    probePanelRepository.save(addProbePanel);
    return HttpResponse.json({ data: { addProbePanel } }, { status: 200 });
  }),
  graphql.mutation<SetProbePanelEnabledMutation, SetProbePanelEnabledMutationVariables>(
    'SetProbePanelEnabled',
    ({ variables }) => {
      const probePanel = probePanelRepository.find('name', variables.name);
      if (probePanel) {
        probePanel.enabled = variables.enabled;
        probePanelRepository.save(probePanel);
        return HttpResponse.json({ data: { setProbePanelEnabled: probePanel } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find Probe panel: "${variables.name}"` }] },
          { status: 404 }
        );
      }
    }
  )
];

export default probePanelHandlers;
