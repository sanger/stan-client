import { Factory } from 'fishery';
import _ from 'lodash';
import {
  BioState,
  Donor,
  Fixative,
  Hmdmc,
  LifeStage,
  Medium,
  Sample,
  SpatialLocation,
  Species,
  Tissue,
  TissueType
} from '../../types/sdk';
import { faker } from '@faker-js/faker';

export const sampleFactory = Factory.define<Sample>(({ sequence, params, associations }) => ({
  __typename: 'Sample',
  id: params.id ?? sequence,
  section: params.section ?? _.random(10),
  tissue: associations.tissue ?? tissueFactory.build(),
  bioState: associations.bioState ?? bioStateFactory.build()
}));

export const tissueFactory: Factory<Tissue> = Factory.define<Tissue>(({ params, associations }) => ({
  __typename: 'Tissue',
  externalName: params.externalName ?? `${faker.person.lastName()}${faker.string.numeric()}`,
  replicate: params.replicate ?? String(_.random(10)),
  spatialLocation: associations.spatialLocation ?? spatialLocationFactory.build(),
  donor: associations.donor ?? donorFactory.build(),
  hmdmc: associations.hmdmc ?? hmdmcFactory.build(),
  medium: associations.medium ?? mediumFactory.build(),
  fixative: associations.fixative ?? fixativeFactory.build()
}));

export const bioStateFactory: Factory<BioState> = Factory.define<BioState>(({ params, sequence }) => ({
  __typename: 'BioState',
  name: params.name ?? `BioState ${sequence}`
}));

export const fixativeFactory: Factory<Fixative> = Factory.define<Fixative>(({ params, sequence }) => ({
  __typename: 'Fixative',
  name: params.name ?? `Fixative ${sequence}`,
  enabled: params.enabled ?? true
}));

export const mediumFactory: Factory<Medium> = Factory.define<Medium>(({ params, sequence }) => ({
  __typename: 'Medium',
  name: params.name ?? `Medium ${sequence}`
}));

export const hmdmcFactory: Factory<Hmdmc> = Factory.define<Hmdmc>(({ params }) => ({
  __typename: 'Hmdmc',
  hmdmc: params.hmdmc ?? `${_.random(1, 99)}-${_.random(100, 10000)}`,
  enabled: params.enabled ?? true
}));

export const donorFactory: Factory<Donor> = Factory.define<Donor>(({ params, associations }) => ({
  __typename: 'Donor',
  donorName: params.donorName ?? `${_.capitalize(faker.lorem.word())}${faker.string.numeric()}`,
  lifeStage: params.lifeStage ?? _.shuffle([LifeStage.Fetal, LifeStage.Paediatric, LifeStage.Adult])[0],
  species: associations.species ?? speciesFactory.build()
}));

export const speciesFactory: Factory<Species> = Factory.define<Species>(({ params, sequence }) => ({
  __typename: 'Species',
  name: params.name ?? `Species ${sequence}`,
  enabled: params.enabled ?? true
}));

export const spatialLocationFactory = Factory.define<SpatialLocation>(({ params, associations }) => ({
  __typename: 'SpatialLocation',
  name: params.name ?? faker.lorem.words(),
  code: params.code ?? _.random(33),
  tissueType: associations.tissueType ?? tissueTypeFactory.build()
}));

export const tissueTypeFactory = Factory.define<TissueType>(({ sequence, params }) => ({
  __typename: 'TissueType',
  name: params.name ?? `Tissue Type ${sequence}`,
  code: params.code ?? faker.string.alpha({ length: 3, casing: 'upper' }),
  spatialLocations: []
}));
