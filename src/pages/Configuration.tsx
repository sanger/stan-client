import React, { useCallback, useContext, useState } from 'react';
import AppShell from '../components/AppShell';
import {
  AddSpatialLocationsMutation,
  AddSpatialLocationsRequest,
  AddTissueTypeMutation,
  AddTissueTypeSpatialLocation,
  GetConfigurationQuery,
  ProbeType,
  TissueTypeFieldsFragment,
  UserRole
} from '../types/sdk';
import EntityManager from '../components/entityManager/EntityManager';
import Heading from '../components/Heading';
import { groupBy } from 'lodash';
import StyledLink from '../components/StyledLink';
import { StanCoreContext } from '../lib/sdk';
import { TabList } from '../components/TabbedPane';
import { Item } from '@react-stately/collections';
import MutedText from '../components/MutedText';
import { alphaNumericSortDefault } from '../types/stan';
import BlueButton from '../components/buttons/BlueButton';
import LoadingSpinner from '../components/icons/LoadingSpinner';
import Success from '../components/notifications/Success';
import { useLoaderData } from 'react-router-dom';
import ComposedEntityManager from '../components/entityManager/ComposedEntityManager';

export default function Configuration() {
  const configuration = useLoaderData() as GetConfigurationQuery;
  const stanCore = useContext(StanCoreContext);
  const groupedComments = groupBy(configuration.comments, 'category');
  const groupedEquipments = groupBy(configuration.equipments, 'category');

  //Listed in alphabetical order
  const configElements = [
    'Biological Risk Assessment Numbers',
    'Cell Classes',
    'Comments',
    'Cost Codes',
    'Destruction Reasons',
    'DNAP study ID and name',
    'Equipments',
    'Fixatives',
    'HuMFre Numbers',
    'Omero Projects',
    'Probe Panels',
    'Projects',
    'Programs',
    'Release Destinations',
    'Release Recipients',
    'Species',
    'Solutions',
    'Tissue Types',
    'Users',
    'Work Types'
  ];

  const [dnapStudies, setDnapStudies] = useState(configuration.dnapStudies);
  const [loading, setLoading] = useState(false);
  const [numberOfDnapStudies, setNumberOfDnapStudies] = useState<number | null>(null);

  const handleRefreshReprojectedEntries = useCallback(() => {
    setLoading(true);
    stanCore.UpdateDnapStudies().then((res) => {
      setDnapStudies(res.updateDnapStudies);
      setNumberOfDnapStudies(res.updateDnapStudies.length);
      setLoading(false);
    });
  }, [stanCore, setLoading, setDnapStudies]);

  //Fill in the Config panels in same order as config Elements
  const configPanels = React.useMemo(() => {
    return [
      /**BioRisk Codes**/
      <div data-testid="config">
        <Heading level={2}>Biological Risk Assessment Numbers</Heading>
        <p className="mt-3 mb-6 text-lg" />
        <EntityManager
          initialEntities={configuration.bioRisks}
          displayKeyColumnName={'code'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore
              .SetBioRiskEnabled({
                enabled,
                code: entity.code
              })
              .then((res) => res.setBioRiskEnabled);
          }}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
          onCreate={(code) => stanCore.AddBioRisk({ code }).then((res) => res.addBioRisk)}
        />
      </div>,

      /**Cell Class**/
      <div data-testid="config">
        <Heading level={2}>Cell Classes</Heading>
        <p className="mt-3 mb-6 text-lg" />
        <EntityManager
          initialEntities={configuration.cellClasses}
          displayKeyColumnName={'name'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore
              .SetCellClassEnabled({
                enabled,
                name: entity.name
              })
              .then((res) => {
                return res.setCellClassEnabled;
              });
          }}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
          onCreate={(name) => stanCore.AddCellClass({ name }).then((res) => res.addCellClass)}
        />
      </div>,
      /**Comments**/
      <div className="space-y-8">
        {Object.keys(groupedComments)
          .sort((a, b) => alphaNumericSortDefault(a.toLowerCase(), b.toLowerCase()))
          .map((category) => (
            <div key={category} data-testid="config" className="space-y-3">
              <Heading level={2}>Comments - {category}</Heading>
              <EntityManager
                initialEntities={groupedComments[category]}
                displayKeyColumnName={'text'}
                valueColumnName={'enabled'}
                onChangeValue={(entity, value) => {
                  const enabled = typeof value === 'boolean' ? value : false;
                  return stanCore
                    .SetCommentEnabled({ commentId: entity.id, enabled })
                    .then((res) => res.setCommentEnabled);
                }}
                onCreate={(text) => stanCore.AddComment({ category, text }).then((res) => res.addComment)}
                valueFieldComponentInfo={{
                  type: 'CHECKBOX'
                }}
              />
            </div>
          ))}
      </div>,

      /**Cost Codes**/
      <div data-testid="config">
        <Heading level={2}>Cost Codes</Heading>
        <p className="mt-3 mb-6 text-lg" />
        <EntityManager
          initialEntities={configuration.costCodes}
          displayKeyColumnName={'code'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore
              .SetCostCodeEnabled({
                enabled,
                code: entity.code
              })
              .then((res) => res.setCostCodeEnabled);
          }}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
          onCreate={(code) => stanCore.AddCostCode({ code }).then((res) => res.addCostCode)}
        />
      </div>,

      /**Destruction Reasons**/
      <div data-testid="config">
        <Heading level={2}>Destruction Reasons</Heading>
        <p className="mt-3 mb-6 text-lg">
          Destruction Reasons are used on the <StyledLink to={'/admin/destroy'}>Destroy</StyledLink> page.
        </p>
        <EntityManager
          initialEntities={configuration.destructionReasons}
          displayKeyColumnName={'text'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore
              .SetDestructionReasonEnabled({
                text: entity.text,
                enabled
              })
              .then((res) => res.setDestructionReasonEnabled);
          }}
          onCreate={(text) => stanCore.AddDestructionReason({ text }).then((res) => res.addDestructionReason)}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
        />
      </div>,

      /**DNAP study ID and name**/

      <div data-testid="config">
        <Heading level={2}>DNAP study ID and name</Heading>
        <p className="mt-3 mb-6 text-lg" />
        <div className="inline-flex">
          <BlueButton onClick={() => handleRefreshReprojectedEntries()}>Refresh DNAP Studies </BlueButton>
          <MutedText className={'pl-2'}>Proceed with caution, as this action demands substantial resources.</MutedText>
        </div>
        <p className="mt-3 mb-6 text-lg" />
        {numberOfDnapStudies !== null && <Success message={`Number of records retrieved: ${numberOfDnapStudies}`} />}

        {loading && <LoadingSpinner />}
        <EntityManager
          initialEntities={dnapStudies}
          displayKeyColumnName={'ssId'}
          extraDisplayColumnName={{
            label: 'Name',
            value: 'name'
          }}
        />
      </div>,

      /**Equipments**/
      <div className="space-y-8">
        {Object.keys(groupedEquipments).map((category) => (
          <div key={category} data-testid="config" className="space-y-3">
            <Heading level={2}>Equipment - {category}</Heading>
            <EntityManager
              initialEntities={groupedEquipments[category]}
              displayKeyColumnName={'name'}
              valueColumnName={'enabled'}
              onChangeValue={(entity, value) => {
                const enabled = typeof value === 'boolean' ? value : false;
                return stanCore
                  .SetEquipmentEnabled({
                    equipmentId: entity.id,
                    enabled
                  })
                  .then((res) => res.setEquipmentEnabled);
              }}
              onCreate={(name) => stanCore.AddEquipment({ category, name }).then((res) => res.addEquipment)}
              valueFieldComponentInfo={{
                type: 'CHECKBOX'
              }}
            />
          </div>
        ))}
      </div>,

      /**Fixatives**/
      <div data-testid="config">
        <Heading level={2}>Fixatives</Heading>
        <p className="mt-3 mb-6 text-lg">
          Fixatives are available on the <StyledLink to={'/admin/registration'}>Block Registration</StyledLink> ,{' '}
          <StyledLink to={'/admin/slide_registration'}>Slide Registration</StyledLink> and{' '}
          <StyledLink to={'/admin/tissue_registration'}>Tissue Sample Registration</StyledLink> pages.
        </p>
        <EntityManager
          initialEntities={configuration.fixatives}
          displayKeyColumnName={'name'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore.SetFixativeEnabled({ enabled, name: entity.name }).then((res) => res.setFixativeEnabled);
          }}
          onCreate={(name) => stanCore.AddFixative({ name }).then((res) => res.addFixative)}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
        />
      </div>,

      /**HumFre Numbers**/
      <div data-testid="config">
        <Heading level={2}>HuMFre Numbers</Heading>
        <p className="mt-3 mb-6 text-lg">
          HuMFre Numbers are available on the <StyledLink to={'/admin/registration'}>Block Registration</StyledLink> ,{' '}
          <StyledLink to={'/admin/slide_registration'}>Slide Registration</StyledLink> and{' '}
          <StyledLink to={'/admin/tissue_registration'}>Tissue Sample Registration</StyledLink> pages.
        </p>
        <EntityManager
          initialEntities={configuration.hmdmcs}
          displayKeyColumnName={'hmdmc'}
          alternateKeyColumnName={'HuMFre'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore.SetHmdmcEnabled({ enabled, hmdmc: entity.hmdmc }).then((res) => res.setHmdmcEnabled);
          }}
          onCreate={(hmdmc) => stanCore.AddHmdmc({ hmdmc }).then((res) => res.addHmdmc)}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
        />
      </div>,
      /**Omero Projects**/
      <div data-testid="config">
        <Heading level={2}>Omero Projects</Heading>
        <p className="mt-3 mb-6 text-lg" />
        <EntityManager
          initialEntities={configuration.omeroProjects}
          displayKeyColumnName={'name'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore
              .SetOmeroProjectEnabled({
                enabled,
                name: entity.name
              })
              .then((res) => res.setOmeroProjectEnabled);
          }}
          onCreate={(name) => stanCore.AddOmeroProject({ name }).then((res) => res.addOmeroProject)}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
        />
      </div>,

      /**Probe Panels**/
      <div className="space-y-8">
        <div data-testid="config">
          <Heading level={2}>Probe Panels - CytAssist</Heading>
          <p className="mt-3 mb-6 text-lg" />
          <EntityManager
            initialEntities={configuration.cytassistProbePanels}
            displayKeyColumnName={'name'}
            valueColumnName={'enabled'}
            onChangeValue={(entity, value) => {
              const enabled = typeof value === 'boolean' ? value : false;
              return stanCore
                .SetProbePanelEnabled({
                  enabled,
                  name: entity.name,
                  type: ProbeType.Cytassist
                })
                .then((res) => res.setProbePanelEnabled);
            }}
            onCreate={(name) =>
              stanCore.AddProbePanel({ type: ProbeType.Cytassist, name }).then((res) => res.addProbePanel)
            }
            valueFieldComponentInfo={{
              type: 'CHECKBOX'
            }}
          />
        </div>
        <div data-testid="config">
          <Heading level={2}>Probe Panels - Spike</Heading>
          <p className="mt-3 mb-6 text-lg" />
          <EntityManager
            initialEntities={configuration.spikeProbePanels}
            displayKeyColumnName={'name'}
            valueColumnName={'enabled'}
            onChangeValue={(entity, value) => {
              const enabled = typeof value === 'boolean' ? value : false;
              return stanCore
                .SetProbePanelEnabled({
                  enabled,
                  name: entity.name,
                  type: ProbeType.Spike
                })
                .then((res) => res.setProbePanelEnabled);
            }}
            onCreate={(name) =>
              stanCore.AddProbePanel({ type: ProbeType.Spike, name }).then((res) => res.addProbePanel)
            }
            valueFieldComponentInfo={{
              type: 'CHECKBOX'
            }}
          />
        </div>
        <div data-testid="config">
          <Heading level={2}>Probe Panels - Xenium</Heading>
          <p className="mt-3 mb-6 text-lg" />
          <EntityManager
            initialEntities={configuration.xeniumProbePanels}
            displayKeyColumnName={'name'}
            valueColumnName={'enabled'}
            onChangeValue={(entity, value) => {
              const enabled = typeof value === 'boolean' ? value : false;
              return stanCore
                .SetProbePanelEnabled({
                  enabled,
                  name: entity.name,
                  type: ProbeType.Xenium
                })
                .then((res) => res.setProbePanelEnabled);
            }}
            onCreate={(name) =>
              stanCore.AddProbePanel({ type: ProbeType.Xenium, name }).then((res) => res.addProbePanel)
            }
            valueFieldComponentInfo={{
              type: 'CHECKBOX'
            }}
          />
        </div>
      </div>,

      /**Projects**/
      <div data-testid="config">
        <Heading level={2}>Projects</Heading>
        <p className="mt-3 mb-6 text-lg" />
        <EntityManager
          initialEntities={configuration.projects}
          displayKeyColumnName={'name'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore
              .SetProjectEnabled({
                enabled,
                name: entity.name
              })
              .then((res) => res.setProjectEnabled);
          }}
          onCreate={(name) => stanCore.AddProject({ name }).then((res) => res.addProject)}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
        />
      </div>,
      /**Programs**/
      <div data-testid="config">
        <Heading level={2}>Programs</Heading>
        <p className="mt-3 mb-6 text-lg" />
        <EntityManager
          initialEntities={configuration.programs}
          displayKeyColumnName={'name'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore
              .SetProgramEnabled({
                enabled,
                name: entity.name
              })
              .then((res) => res.setProgramEnabled);
          }}
          onCreate={(name) => stanCore.AddProgram({ name }).then((res) => res.addProgram)}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
        />
      </div>,

      /**Release Destinations**/
      <div data-testid="config">
        <Heading level={2}>Release Destinations</Heading>
        <p className="mt-3 mb-6 text-lg">
          Release Destinations are available on the <StyledLink to={'/admin/release'}>Release</StyledLink> page.
        </p>
        <EntityManager
          initialEntities={configuration.releaseDestinations}
          displayKeyColumnName={'name'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore
              .SetReleaseDestinationEnabled({
                enabled,
                name: entity.name
              })
              .then((res) => res.setReleaseDestinationEnabled);
          }}
          onCreate={(name) => stanCore.AddReleaseDestination({ name }).then((res) => res.addReleaseDestination)}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
        />
      </div>,

      /**Release Recipients**/
      <div data-testid="config">
        <Heading level={2}>Release Recipients</Heading>
        <p className="mt-3 mb-6 text-lg">
          Release Recipients are available on the <StyledLink to={'/admin/release'}>Release</StyledLink> page. They are
          also available on the <StyledLink to={'/sgp'}>SGP Management</StyledLink> page as "Work Requester"
        </p>
        <EntityManager
          initialEntities={configuration.releaseRecipients.map((rr) => ({
            ...rr,
            fullName: rr.fullName || ''
          }))}
          displayKeyColumnName={'username'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore
              .SetReleaseRecipientEnabled({
                enabled,
                username: String(entity.username)
              })
              .then((res) => {
                return {
                  ...res.setReleaseRecipientEnabled,
                  fullName: res.setReleaseRecipientEnabled.fullName || ''
                };
              });
          }}
          onCreate={(username, fullName) => {
            return stanCore.AddReleaseRecipient({ username, fullName }).then((res) => {
              return {
                ...res.addReleaseRecipient,
                fullName: res.addReleaseRecipient.fullName || ''
              };
            });
          }}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
          extraDisplayColumnName={{
            label: 'Full Name',
            value: 'fullName',
            extraFieldPlaceholder: 'Enter Full Name',
            keyFieldPlaceholder: 'Enter User ID',
            onChange: (username, fullName) => {
              return stanCore.UpdateReleaseRecipientFullName({ username, fullName }).then((res) => {
                return {
                  ...res.updateReleaseRecipientFullName,
                  fullName: res.updateReleaseRecipientFullName.fullName || ''
                };
              });
            }
          }}
        />
      </div>,

      /**Species**/
      <div data-testid="config">
        <Heading level={2}>Species</Heading>
        <p className="mt-3 mb-6 text-lg">
          Species are available on the <StyledLink to={'/admin/registration'}>Block Registration</StyledLink> ,{' '}
          <StyledLink to={'/admin/slide_registration'}>Slide Registration</StyledLink> and{' '}
          <StyledLink to={'/admin/tissue_registration'}>Tissue Sample Registration</StyledLink> pages.
        </p>
        <EntityManager
          initialEntities={configuration.species}
          displayKeyColumnName={'name'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore.SetSpeciesEnabled({ enabled, name: entity.name }).then((res) => res.setSpeciesEnabled);
          }}
          onCreate={(name) => stanCore.AddSpecies({ name }).then((res) => res.addSpecies)}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
        />
      </div>,
      /**Solutions**/
      <div data-testid="config">
        <Heading level={2}>Solutions</Heading>
        <p className="mt-3 mb-6 text-lg">
          Solutions are available on the{' '}
          <StyledLink to={'/admin/tissue_registration'}>Original Sample Registration</StyledLink> page.
        </p>
        <EntityManager
          initialEntities={configuration.solutions}
          displayKeyColumnName={'name'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore
              .SetSolutionEnabled({
                name: entity.name,
                enabled
              })
              .then((res) => res.setSolutionEnabled);
          }}
          onCreate={(name) => stanCore.AddSolution({ name }).then((res) => res.addSolution)}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
        />
      </div>,
      /**Tissue Types**/
      <div data-testid="config">
        <Heading level={2}>Tissue Types</Heading>
        <ComposedEntityManager<
          TissueTypeFieldsFragment,
          AddTissueTypeMutation,
          AddTissueTypeSpatialLocation,
          AddSpatialLocationsMutation
        >
          composedEntities={configuration.tissueTypes}
          entitiesDef={{
            name: 'Tissue Type',
            type: 'TissueType',
            properties: [
              {
                propertyName: 'name',
                propertyType: 'string'
              },
              {
                propertyName: 'code',
                propertyType: 'string'
              }
            ],
            orderBy: 'name',
            onCreate: (entity: TissueTypeFieldsFragment) => {
              return stanCore.AddTissueType({ request: entity });
            },
            toString: (entity: TissueTypeFieldsFragment) => {
              return entity.name;
            }
          }}
          nestedEntitiesDef={{
            name: 'Spatial Location',
            type: 'spatialLocations',
            properties: [
              {
                propertyName: 'name',
                propertyType: 'string'
              },
              {
                propertyName: 'code',
                propertyType: 'number'
              }
            ],
            orderBy: 'code',
            onCreate: (entity: AddTissueTypeSpatialLocation, parentEntity?: TissueTypeFieldsFragment) => {
              const request: AddSpatialLocationsRequest = {
                name: parentEntity ? parentEntity.name : '',
                spatialLocations: [entity]
              };
              return stanCore.AddSpatialLocations({ request });
            },
            initialValue: {
              name: 'No spatial information',
              code: 0
            }
          }}
        />
      </div>,
      /**Users**/
      <div data-testid="config">
        <Heading level={2}>Users</Heading>
        <EntityManager
          initialEntities={configuration.users}
          displayKeyColumnName={'username'}
          valueColumnName={'role'}
          valueFieldComponentInfo={{
            type: 'SELECT',
            valueOptions: Object.values(UserRole)
          }}
          onCreate={(username) => stanCore.AddUser({ username }).then((res) => res.addUser)}
          onChangeValue={(entity, value) => {
            const role: UserRole = typeof value === 'string' ? (value as UserRole) : UserRole.Normal;
            return stanCore.SetUserRole({ username: entity.username, role }).then((res) => res.setUserRole);
          }}
        />
      </div>,

      /**Work Types**/
      <div data-testid="config">
        <Heading level={2}>Work Types</Heading>
        <p className="mt-3 mb-6 text-lg" />
        <EntityManager
          initialEntities={configuration.workTypes}
          displayKeyColumnName={'name'}
          valueColumnName={'enabled'}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === 'boolean' ? value : false;
            return stanCore
              .SetWorkTypeEnabled({
                enabled,
                name: entity.name
              })
              .then((res) => res.setWorkTypeEnabled);
          }}
          onCreate={(name) => stanCore.AddWorkType({ name }).then((res) => res.addWorkType)}
          valueFieldComponentInfo={{
            type: 'CHECKBOX'
          }}
        />
      </div>
    ];
  }, [
    groupedComments,
    configuration,
    groupedEquipments,
    stanCore,
    handleRefreshReprojectedEntries,
    loading,
    dnapStudies,
    numberOfDnapStudies
  ]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>STAN Configuration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <MutedText className="mt-5">
            Press left/right arrows in keyboard to navigate to tabs that are not in display.
          </MutedText>
          {configPanels.length === configElements.length && (
            <TabList>
              {configElements.map((title, indx) => (
                <Item key={title} title={title}>
                  <div className={'mt-4'}>{configPanels[indx]}</div>
                </Item>
              ))}
            </TabList>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
