import { graphql, HttpResponse } from 'msw';
import {
  AddEquipmentMutation,
  AddEquipmentMutationVariables,
  GetEquipmentsQuery,
  GetEquipmentsQueryVariables,
  SetEquipmentEnabledMutation,
  SetEquipmentEnabledMutationVariables
} from '../../types/sdk';
import equipmentFactory from '../../lib/factories/equipmentFactory';
import equipmentRepository from '../repositories/equipmentRepository';
import { isEnabled } from '../../lib/helpers';

const equipmentHandlers = [
  graphql.mutation<AddEquipmentMutation, AddEquipmentMutationVariables>('AddEquipment', ({ variables }) => {
    const addEquipment = equipmentFactory.build({
      name: variables.name
    });
    equipmentRepository.save(addEquipment);
    return HttpResponse.json({ data: { addEquipment } }, { status: 200 });
  }),

  graphql.mutation<SetEquipmentEnabledMutation, SetEquipmentEnabledMutationVariables>(
    'SetEquipmentEnabled',
    ({ variables }) => {
      const equipment = equipmentRepository.find('id', variables.equipmentId);
      if (equipment) {
        equipment.enabled = variables.enabled;
        equipmentRepository.save(equipment);
        return HttpResponse.json({ data: { setEquipmentEnabled: equipment } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find equipment: "${variables.equipmentId}"` }] },
          { status: 404 }
        );
      }
    }
  ),
  graphql.query<GetEquipmentsQuery, GetEquipmentsQueryVariables>('GetEquipments', ({ variables }) => {
    return HttpResponse.json(
      {
        data: {
          equipments: equipmentRepository
            .findAll()
            .filter(
              (equipment) =>
                (!variables.category || variables.category === equipment.category) &&
                (variables.includeDisabled || isEnabled(equipment))
            )
        }
      },
      { status: 200 }
    );
  })
];

export default equipmentHandlers;
