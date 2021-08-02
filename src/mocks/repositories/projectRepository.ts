import { ProjectFieldsFragment } from "../../types/sdk";
import projectFactory from "../../lib/factories/projectFactory";
import { createSessionStorageRepository } from "./index";

const seeds: Array<ProjectFieldsFragment> = projectFactory.buildList(5);
seeds.push(projectFactory.build({ enabled: false }));

const projectRepository = createSessionStorageRepository(
  "PROJECTS",
  "name",
  seeds
);

export default projectRepository;
