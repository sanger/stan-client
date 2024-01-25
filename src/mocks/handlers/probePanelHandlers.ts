import { graphql } from 'msw';
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
  graphql.query<GetProbePanelsQuery, GetProbePanelsQueryVariables>('GetProbePanels', (req, res, ctx) => {
    return res(
      ctx.data({
        probePanels: probePanelRepository.findAll()
      })
    );
  }),
  graphql.mutation<AddProbePanelMutation, AddProbePanelMutationVariables>('AddProbePanel', (req, res, ctx) => {
    const addProbePanel = probePanelFactory.build({ name: req.variables.name });
    probePanelRepository.save(addProbePanel);
    return res(ctx.data({ addProbePanel }));
  }),
  graphql.mutation<SetProbePanelEnabledMutation, SetProbePanelEnabledMutationVariables>(
    'SetProbePanelEnabled',
    (req, res, ctx) => {
      const probePanel = probePanelRepository.find('name', req.variables.name);
      if (probePanel) {
        probePanel.enabled = req.variables.enabled;
        probePanelRepository.save(probePanel);
        return res(ctx.data({ setProbePanelEnabled: probePanel }));
      } else {
        return res(ctx.errors([{ message: `Could not find Probe panel: "${req.variables.name}"` }]));
      }
    }
  )
];

export default probePanelHandlers;
