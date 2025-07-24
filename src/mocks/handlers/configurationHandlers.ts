import { graphql, HttpResponse } from 'msw';
import { GetConfigurationQuery, GetConfigurationQueryVariables, ProbeType } from '../../types/sdk';
import releaseDestinationRepository from '../repositories/releaseDestinationRepository';
import releaseRecipientRepository from '../repositories/releaseRecipientRepository';
import commentRepository from '../repositories/commentRepository';
import hmdmcRepository from '../repositories/hmdmcRepository';
import speciesRepository from '../repositories/speciesRepository';
import fixativeRepository from '../repositories/fixativeRepository';
import destructionReasonRepository from '../repositories/destructionReasonRepository';
import projectRepository from '../repositories/projectRepository';
import costCodeRepository from '../repositories/costCodeRepository';
import workTypeRepository from '../repositories/workTypeRepository';
import equipmentRepository from '../repositories/equipmentRepository';
import solutionRepository from '../repositories/solutionRepository';
import userRepository from '../repositories/userRepository';
import programRepository from '../repositories/programRepository';
import omeroProjectRepository from '../repositories/omeroProjectRepository';
import dnapStudyRepository from '../repositories/dnapStudyRepository';
import probePanelRepository from '../repositories/probePanelRepository';
import bioRiskRepository from '../repositories/bioRiskRepository';
import tissueTypeRepository from '../repositories/tissueTypeRepository';
import cellClassRepository from '../repositories/cellClassRepository';

const configurationHandlers = [
  graphql.query<GetConfigurationQuery, GetConfigurationQueryVariables>('GetConfiguration', () => {
    return HttpResponse.json({
      data: {
        destructionReasons: destructionReasonRepository.findAll(),
        releaseRecipients: releaseRecipientRepository.findAll(),
        comments: commentRepository.findAll(),
        releaseDestinations: releaseDestinationRepository.findAll(),
        hmdmcs: hmdmcRepository.findAll(),
        species: speciesRepository.findAll(),
        fixatives: fixativeRepository.findAll(),
        projects: projectRepository.findAll(),
        costCodes: costCodeRepository.findAll(),
        workTypes: workTypeRepository.findAll(),
        equipments: equipmentRepository.findAll(),
        solutions: solutionRepository.findAll(),
        users: userRepository.findAll(),
        programs: programRepository.findAll(),
        omeroProjects: omeroProjectRepository.findAll(),
        dnapStudies: dnapStudyRepository.findAll(),
        xeniumProbePanels: probePanelRepository.findAll().filter((panel) => panel.type === ProbeType.Xenium),
        cytassistProbePanels: probePanelRepository.findAll().filter((panel) => panel.type === ProbeType.Cytassist),
        spikeProbePanels: probePanelRepository.findAll().filter((panel) => panel.type === ProbeType.Spike),
        bioRisks: bioRiskRepository.findAll(),
        tissueTypes: tissueTypeRepository.findAll(),
        cellClasses: cellClassRepository.findAll()
      }
    });
  })
];

export default configurationHandlers;
