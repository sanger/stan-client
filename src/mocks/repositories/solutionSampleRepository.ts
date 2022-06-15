import { SolutionSampleFieldsFragment } from "../../types/sdk";
import { createSessionStorageRepository } from "./index";
import solutionSampleFactory from "../../lib/factories/solutionSampleFactory";

const seeds: Array<SolutionSampleFieldsFragment> = [
  solutionSampleFactory.build({ name: "HypoThermosol", enabled: true }),
  solutionSampleFactory.build({ name: "Ethanol", enabled: true }),
  solutionSampleFactory.build({ name: "PFA", enabled: true }),
  solutionSampleFactory.build({ name: "PBS", enabled: true }),
  solutionSampleFactory.build({ name: "Formalin", enabled: true }),
];

const solutionSampleRepository = createSessionStorageRepository(
  "SOLUTION SAMPLE",
  "name",
  seeds
);

export default solutionSampleRepository;
