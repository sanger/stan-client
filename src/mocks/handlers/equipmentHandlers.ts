import { graphql } from "msw";
import {
  AddEquipmentMutation,
  AddEquipmentMutationVariables,
  SetEquipmentEnabledMutation,
  SetEquipmentEnabledMutationVariables,
} from "../../types/sdk";
import equipmentFactory from "../../lib/factories/equipmentFactory";
import equipmentRepository from "../repositories/equipmentRepository";

const equipmentHandlers = [
  graphql.mutation<AddEquipmentMutation, AddEquipmentMutationVariables>(
    "AddEquipment",
    (req, res, ctx) => {
      const addEquipment = equipmentFactory.build({
        name: req.variables.name,
      });
      equipmentRepository.save(addEquipment);
      return res(ctx.data({ addEquipment }));
    }
  ),

  graphql.mutation<
    SetEquipmentEnabledMutation,
    SetEquipmentEnabledMutationVariables
  >("SetEquipmentEnabled", (req, res, ctx) => {
    const equipment = equipmentRepository.find("id", req.variables.equipmentId);
    if (equipment) {
      equipment.enabled = req.variables.enabled;
      equipmentRepository.save(equipment);
      return res(ctx.data({ setEquipmentEnabled: equipment }));
    } else {
      return res(
        ctx.errors([
          {
            message: `Could not find equipment: "${req.variables.equipmentId}"`,
          },
        ])
      );
    }
  }),
];

export default equipmentHandlers;
