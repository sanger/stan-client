import { HmdmcFieldsFragment } from "../../types/graphql";
import { createSessionStorageRepository } from "./index";
import hmdmcFactory from "../../lib/factories/hmdmcFactory";

const seeds: Array<HmdmcFieldsFragment> = [
  hmdmcFactory.build({ hmdmc: "HMDMC1" }),
  hmdmcFactory.build({ hmdmc: "HMDMC2" }),
  hmdmcFactory.build({ hmdmc: "HMDMC3" }),
  hmdmcFactory.build({ hmdmc: "HMDMC4" }),
  hmdmcFactory.build({ hmdmc: "HMDMC5", enabled: false }),
];

const hmdmcRepository = createSessionStorageRepository("HMDMC", "hmdmc", seeds);

export default hmdmcRepository;
