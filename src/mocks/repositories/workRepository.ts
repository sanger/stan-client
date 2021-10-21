import { WorkFieldsFragment, WorkStatus } from "../../types/sdk";
import workFactory from "../../lib/factories/workFactory";
import { createSessionStorageRepository } from "./index";

const workSeeds: Array<WorkFieldsFragment> = [
  ...workFactory.buildList(3),
  workFactory.build(undefined, { transient: { isRnD: true } }),
  workFactory.build({ status: WorkStatus.Paused }),
  workFactory.build({ status: WorkStatus.Failed }),
];

const workRepository = createSessionStorageRepository(
  "WORK",
  "workNumber",
  workSeeds
);

export default workRepository;
