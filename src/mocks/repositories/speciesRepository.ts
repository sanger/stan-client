import { SpeciesFieldsFragment } from "../../types/sdk";
import { createSessionStorageRepository } from "./index";
import speciesFactory from "../../lib/factories/speciesFactory";

const speciesSeeds: Array<SpeciesFieldsFragment> = [
  speciesFactory.build({ name: "Human" }),
  speciesFactory.build({ name: "Mouse" }),
  speciesFactory.build({ name: "Pig" }),
  speciesFactory.build({ name: "Hamster" }),
];

const speciesRepository = createSessionStorageRepository(
  "SPECIES",
  "name",
  speciesSeeds
);

export default speciesRepository;
