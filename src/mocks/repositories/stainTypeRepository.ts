import { StainTypeFieldsFragment } from "../../types/sdk";
import stainTypeFactory from "../../lib/factories/stainTypeFactory";
import { createSessionStorageRepository } from "./index";

const stainTypeSeeds: Array<StainTypeFieldsFragment> = [
  stainTypeFactory.build({
    name: "H&E",
    measurementTypes: ["Haematoxylin", "Blueing", "Eosin"],
  }),
  stainTypeFactory.build({ name: "Masson's Trichrome" }),
];

const stainTypeRepo = createSessionStorageRepository(
  "STAIN_TYPE",
  "name",
  stainTypeSeeds
);

export default stainTypeRepo;
