import { graphql, HttpResponse } from 'msw';
import { uniqueId } from 'lodash';
import {
  GetRegistrationInfoQuery,
  GetRegistrationInfoQueryVariables,
  LabwareState,
  LifeStage,
  RegisterOriginalSamplesMutation,
  RegisterOriginalSamplesMutationVariables,
  RegisterSectionsMutation,
  RegisterSectionsMutationVariables,
  RegisterTissuesMutation,
  RegisterTissuesMutationVariables
} from '../../types/sdk';
import { labwareTypeInstances } from '../../lib/factories/labwareTypeFactory';
import speciesRepository from '../repositories/speciesRepository';
import hmdmcRepository from '../repositories/hmdmcRepository';
import solutionRepository from '../repositories/solutionRepository';
import slotRegionRepository from '../repositories/slotRegionRepository';
import bioRiskRepository from '../repositories/bioRiskRepository';

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
              __typename: 'TissueType',
              name: 'Liver',
              spatialLocations: [
                {
                  __typename: 'SpatialLocation',
                  name: 'Not specified',
                  code: 0
                },
                {
                  __typename: 'SpatialLocation',
                  name: 'Liver segments IV (left lobe)',
                  code: 1
                },
                {
                  __typename: 'SpatialLocation',
                  name: 'Surface cranial region',
                  code: 2
                },
                {
                  __typename: 'SpatialLocation',
                  name: 'Surface central region',
                  code: 3
                },
                {
                  __typename: 'SpatialLocation',
                  name: 'Surface caudal region',
                  code: 4
                },
                {
                  __typename: 'SpatialLocation',
                  name: 'Deep parenchymal central region (towards hilum)',
                  code: 5
                },
                {
                  __typename: 'SpatialLocation',
                  name: 'Right lobe (fine needle aspiration samples)',
                  code: 6
                }
              ]
            },
            {
              __typename: 'TissueType',
              name: 'Kidney',
              spatialLocations: [
                {
                  __typename: 'SpatialLocation',
                  name: 'Not specified',
                  code: 0
                },
                {
                  __typename: 'SpatialLocation',
                  name: 'Cortex',
                  code: 1
                },
                {
                  __typename: 'SpatialLocation',
                  name: 'Medulla at equator',
                  code: 2
                },
                {
                  __typename: 'SpatialLocation',
                  name: 'Pelvis at equator',
                  code: 3
                },
                {
                  __typename: 'SpatialLocation',
                  name: 'Upper pole',
                  code: 4
                },
                {
                  __typename: 'SpatialLocation',
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
          bioRisks: bioRiskRepository.findAll().filter((bioRisk) => bioRisk.enabled)
        }
      },
      { status: 200 }
    );
  }),

  graphql.mutation<RegisterTissuesMutation, RegisterTissuesMutationVariables>('RegisterTissues', () => {
    return HttpResponse.json({
      data: {
        register: {
          clashes: [],
          labwareSolutions: [
            {
              barcode: 'LW_BC_1',
              solutionName: 'Ethanol'
            }
          ],
          labware: [
            {
              id: 1,
              barcode: 'LW_BC_1',
              released: false,
              discarded: false,
              destroyed: false,
              state: LabwareState.Active,
              created: new Date().toISOString(),
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
                  block: true,
                  samples: [
                    {
                      id: 1,
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
                          name: 'Cortex',
                          code: 3,
                          tissueType: {
                            name: 'Lung'
                          }
                        }
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
  }),

  graphql.mutation<RegisterSectionsMutation, RegisterSectionsMutationVariables>('RegisterSections', ({ variables }) => {
    return HttpResponse.json({
      data: {
        registerSections: {
          labware: variables.request.labware.map((labware) => {
            let labwareId = parseInt(uniqueId());
            return {
              id: labwareId,
              released: false,
              discarded: false,
              destroyed: false,
              state: LabwareState.Active,
              created: Date(),
              labwareType: {
                name: labware.labwareType,
                // numRows and numColumns not correct but don't need to be for this particular mock
                numRows: 1,
                numColumns: 1,
                labelType: {
                  name: 'Label Type 1'
                }
              },
              barcode: labware.externalBarcode,
              slots: labware.contents.map((content) => ({
                id: -1,
                labwareId,
                block: false,
                address: content.address,
                samples: [
                  {
                    id: parseInt(uniqueId()),
                    tissue: {
                      spatialLocation: {
                        name: 'Cortex',
                        code: content.spatialLocation,
                        tissueType: {
                          name: content.tissueType
                        }
                      },
                      externalName: content.externalIdentifier,
                      replicate: content.replicateNumber,
                      medium: {
                        name: content.medium
                      },
                      fixative: {
                        name: content.fixative,
                        enabled: true
                      },
                      donor: {
                        donorName: content.donorIdentifier,
                        lifeStage: content.lifeStage
                      }
                    },
                    bioState: { name: 'Tissue' }
                  }
                ]
              }))
            };
          })
        }
      }
    });
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
                released: false,
                discarded: false,
                destroyed: false,
                state: LabwareState.Active,
                created: new Date().toISOString(),
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
                    block: true,
                    samples: [
                      {
                        id: 1,
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
                          }
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
