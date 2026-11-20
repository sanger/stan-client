import { graphql, HttpResponse } from 'msw';
import {
  GetRegistrationInfoQuery,
  GetRegistrationInfoQueryVariables,
  LabwareState,
  LifeStage,
  RegisterOriginalSamplesMutation,
  RegisterOriginalSamplesMutationVariables
} from '../../types/sdk';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import speciesRepository from '../repositories/speciesRepository';
import hmdmcRepository from '../repositories/hmdmcRepository';
import solutionRepository from '../repositories/solutionRepository';
import slotRegionRepository from '../repositories/slotRegionRepository';
import bioRiskRepository from '../repositories/bioRiskRepository';
import cellClassRepository from '../repositories/cellClassRepository';

const registrationHandlers = [
  graphql.query<GetRegistrationInfoQuery, GetRegistrationInfoQueryVariables>('GetRegistrationInfo', ({ variables }) => {
    return HttpResponse.json(
      {
        data: {
          species: speciesRepository.findAll().filter((species) => species.enabled),
          hmdmcs: hmdmcRepository.findAll().filter((hmdmc) => hmdmc.enabled),
          labwareTypes: labwareTypeInstances,
          tissueTypes: [
            {
              name: 'Liver',
              spatialLocations: [
                {
                  name: 'Not specified',
                  code: 0
                },
                {
                  name: 'Liver segments IV (left lobe)',
                  code: 1
                },
                {
                  name: 'Surface cranial region',
                  code: 2
                },
                {
                  name: 'Surface central region',
                  code: 3
                },
                {
                  name: 'Surface caudal region',
                  code: 4
                },
                {
                  name: 'Deep parenchymal central region (towards hilum)',
                  code: 5
                },
                {
                  name: 'Right lobe (fine needle aspiration samples)',
                  code: 6
                }
              ]
            },
            {
              name: 'Kidney',
              spatialLocations: [
                {
                  name: 'Not specified',
                  code: 0
                },
                {
                  name: 'Cortex',
                  code: 1
                },
                {
                  name: 'Medulla at equator',
                  code: 2
                },
                {
                  name: 'Pelvis at equator',
                  code: 3
                },
                {
                  name: 'Upper pole',
                  code: 4
                },
                {
                  name: 'Lower pole',
                  code: 5
                }
              ]
            }
          ],
          fixatives: [{ name: 'None' }, { name: 'Formalin' }],
          mediums: [{ name: 'OCT' }, { name: 'Paraffin' }, { name: 'None' }],
          solutions: solutionRepository.findAll().filter((sample) => sample.enabled),
          slotRegions: slotRegionRepository.findAll().filter((region) => region.enabled),
          bioRisks: bioRiskRepository.findAll().filter((bioRisk) => bioRisk.enabled),
          cellClasses: cellClassRepository.findAll().filter((cellClass) => cellClass.enabled)
        }
      },
      { status: 200 }
    );
  }),

  graphql.mutation<RegisterOriginalSamplesMutation, RegisterOriginalSamplesMutationVariables>(
    'RegisterOriginalSamples',
    () => {
      return HttpResponse.json({
        data: {
          registerOriginalSamples: {
            labwareSolutions: [
              {
                barcode: 'LW_BC_1',
                solutionName: 'Ethanol'
              }
            ],
            clashes: [],
            labware: [
              {
                id: 1,
                barcode: 'LW_BC_1',
                externalBarcode: null,
                released: false,
                discarded: false,
                destroyed: false,
                state: LabwareState.Active,
                frozen: false,
                created: new Date().toISOString(),
                numRows: 1,
                numColumns: 1,
                labwareType: {
                  name: 'Proviasette',
                  numRows: 1,
                  numColumns: 1,
                  labelType: {
                    name: 'Label Type 1'
                  }
                },
                slots: [
                  {
                    id: 1,
                    address: 'A1',
                    labwareId: 1,
                    samples: [
                      {
                        id: 1,
                        section: null,
                        blockHighestSection: null,
                        tissue: {
                          externalName: 'EXT1',
                          replicate: '5',
                          fixative: {
                            name: 'Formalin',
                            enabled: true
                          },
                          medium: {
                            name: 'Paraffin'
                          },
                          donor: {
                            donorName: 'Donor 3',
                            lifeStage: LifeStage.Adult
                          },
                          spatialLocation: {
                            code: 3,
                            name: 'Surface cranial region',
                            tissueType: {
                              name: 'Lung'
                            }
                          },
                          collectionDate: null,
                          hmdmc: null
                        },
                        bioState: { name: 'Tissue' }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      });
    }
  )
];

export default registrationHandlers;
