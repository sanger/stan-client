import { SolutionFieldsFragment } from "../../types/sdk";
import { createSessionStorageRepository } from "./index";
import solutionFactory from "../../lib/factories/solutionFactory";

const seeds: Array<SolutionFieldsFragment> = [
  solutionFactory.build({ name: "HypoThermosol", enabled: true }),
  solutionFactory.build({ name: "Ethanol", enabled: true }),
  solutionFactory.build({ name: "PFA", enabled: true }),
  solutionFactory.build({ name: "PBS", enabled: true }),
  solutionFactory.build({ name: "Formalin", enabled: true }),
];

const solutionRepository = createSessionStorageRepository(
  "SOLUTION",
  "name",
  seeds
);

export default solutionRepository;
