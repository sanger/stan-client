import { SasNumberFieldsFragment } from "../../types/sdk";
import sasNumberFactory from "../../lib/factories/sasNumberFactory";
import { createSessionStorageRepository } from "./index";

const sasNumberSeeds: Array<SasNumberFieldsFragment> = [
  ...sasNumberFactory.buildList(3),
  sasNumberFactory.build(undefined, { transient: { isRnD: true } }),
];

const sasNumberRepository = createSessionStorageRepository(
  "SASNUMBERS",
  "sasNumber",
  sasNumberSeeds
);

export default sasNumberRepository;
