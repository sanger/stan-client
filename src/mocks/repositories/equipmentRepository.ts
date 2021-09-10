import { EquipmentFieldsFragment } from "../../types/sdk";
import equipmentFactory from "../../lib/factories/equipmentFactory";
import { createSessionStorageRepository } from "./index";

const seeds: Array<EquipmentFieldsFragment> = [
  equipmentFactory.build({ name: "Hamatsu S60", category: "scanner" }),
  equipmentFactory.build({ name: "Phenix", category: "scanner" }),
  equipmentFactory.build({ name: "3dhistech", category: "scanner" }),
  equipmentFactory.build({ name: "Operetta", category: "scanner" }),
  equipmentFactory.build({ name: "Iron Man", category: "robot" }),
  equipmentFactory.build({
    name: "Iron Patriot",
    category: "robot",
    enabled: false,
  }),
];

const equipmentRepository = createSessionStorageRepository(
  "EQUIPMENT",
  "name",
  seeds
);

export default equipmentRepository;
