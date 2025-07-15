import { graphql, HttpResponse } from 'msw';
import {
  AddCellClassMutation,
  AddCellClassMutationVariables,
  GetCellClassesQuery,
  GetCellClassesQueryVariables,
  SetCellClassEnabledMutation,
  SetCellClassEnabledMutationVariables
} from '../../types/sdk';
import { isEnabled } from '../../lib/helpers';
import cellClassFactory from '../../lib/factories/cellClassFactory';
import cellClassRepository from '../repositories/cellClassRepository';

const cellClassHandlers = [
  graphql.mutation<AddCellClassMutation, AddCellClassMutationVariables>('AddCellClass', ({ variables }) => {
    const addCellClass = cellClassFactory.build({
      name: variables.name
    });
    cellClassRepository.save(addCellClass);
    return HttpResponse.json({ data: { addCellClass } }, { status: 200 });
  }),

  graphql.mutation<SetCellClassEnabledMutation, SetCellClassEnabledMutationVariables>(
    'SetCellClassEnabled',
    ({ variables }) => {
      const cellClass = cellClassRepository.find('name', variables.name);
      if (cellClass) {
        cellClass.enabled = variables.enabled;
        cellClassRepository.save(cellClass);
        return HttpResponse.json({ data: { setCellClassEnabled: cellClass } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find the cellular classification with name: "${variables.name}"` }] },
          { status: 404 }
        );
      }
    }
  ),
  graphql.query<GetCellClassesQuery, GetCellClassesQueryVariables>('GetCellClasses', ({ variables }) => {
    return HttpResponse.json(
      {
        data: {
          cellClasses: cellClassRepository
            .findAll()
            .filter((cellClass) => variables.includeDisabled || isEnabled(cellClass))
        }
      },
      { status: 200 }
    );
  })
];

export default cellClassHandlers;
