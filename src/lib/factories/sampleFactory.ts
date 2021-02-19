import { Factory } from "fishery";
import _ from "lodash";
import {
  Donor,
  Fixative,
  Hmdmc,
  LifeStage,
  Medium,
  MouldSize,
  Sample,
  SpatialLocation,
  Tissue,
  TissueType,
} from "../../types/graphql";
import * as faker from "faker";

export const sampleFactory = Factory.define<Sample>(
  ({ sequence, params, associations }) => ({
    id: params.id ?? sequence,
    section: params.section ?? _.random(10),
    tissue: associations.tissue ?? tissueFactory.build(),
  })
);

export const tissueFactory: Factory<Tissue> = Factory.define<Tissue>(
  ({ sequence, params, associations }) => ({
    externalName:
      params.externalName ?? `${faker.name.lastName()}${faker.random.number()}`,
    replicate: params.replicate ?? _.random(10),
    spatialLocation:
      associations.spatialLocation ?? spatialLocationFactory.build(),
    donor: associations.donor ?? donorFactory.build(),
    hmdmc: associations.hmdmc ?? hmdmcFactory.build(),
    mouldSize: associations.mouldSize ?? mouldSizeFactory.build(),
    medium: associations.medium ?? mediumFactory.build(),
    fixative: associations.fixative ?? fixativeFactory.build(),
  })
);

export const fixativeFactory: Factory<Fixative> = Factory.define<Fixative>(
  ({ params, sequence }) => ({
    name: params.name ?? `Fixative ${sequence}`,
  })
);

export const mediumFactory: Factory<Medium> = Factory.define<Medium>(
  ({ params, sequence }) => ({
    name: params.name ?? `Medium ${sequence}`,
  })
);

export const mouldSizeFactory: Factory<MouldSize> = Factory.define<MouldSize>(
  ({ params, sequence }) => ({
    name: params.name ?? `Mould Size ${sequence}`,
  })
);

export const hmdmcFactory: Factory<Hmdmc> = Factory.define<Hmdmc>(
  ({ sequence, params }) => ({
    hmdmc: params.hmdmc ?? `${_.random(1, 99)}-${_.random(100, 10000)}`,
  })
);

export const donorFactory: Factory<Donor> = Factory.define<Donor>(
  ({ params, sequence }) => ({
    donorName:
      params.donorName ??
      `${_.capitalize(faker.random.word())}${faker.random.number()}`,
    lifeStage:
      params.lifeStage ??
      _.shuffle([LifeStage.Fetal, LifeStage.Paediatric, LifeStage.Adult])[0],
  })
);

export const spatialLocationFactory = Factory.define<SpatialLocation>(
  ({ sequence, params, associations }) => ({
    name: params.name ?? "MONKEY",
    code: params.code ?? _.random(33),
    tissueType: associations.tissueType ?? tissueTypeFactory.build(),
  })
);

export const tissueTypeFactory = Factory.define<TissueType>(
  ({ sequence, params }) => ({
    name: params.name ?? `Tissue Type ${sequence}`,
    spatialLocations: [],
  })
);
