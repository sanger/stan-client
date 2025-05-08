import { graphql, HttpResponse } from 'msw';
import { AddTissueTypeMutation, AddTissueTypeMutationVariables } from '../../types/sdk';
import { tissueTypeFactory } from '../../lib/factories/sampleFactory';
import tissueTypeRepository from '../repositories/tissueTypeRepository';

const tissueTypeHandlers = [
  graphql.mutation<AddTissueTypeMutation, AddTissueTypeMutationVariables>('AddTissueType', ({ variables }) => {
    const existing = tissueTypeRepository
      .findAll()
      .find((t) => t.name === variables.request.name || t.code === variables.request.code);

    if (existing) {
      const isNameMatch = existing.name === variables.request.name;
      const conflictField = isNameMatch ? 'name' : 'code';
      const conflictValue = isNameMatch ? variables.request.name : variables.request.code;

      return HttpResponse.json(
        {
          errors: [{ message: `Tissue type with ${conflictField} = ${conflictValue} already exists` }]
        },
        { status: 400 }
      );
    }

    const tissueType = tissueTypeFactory.build({
      name: variables.request.name,
      code: variables.request.code,
      spatialLocations: []
    });

    tissueType.spatialLocations = variables.request.spatialLocations.map((spatialLocation) => {
      return {
        ...spatialLocation,
        tissueType
      };
    });
    tissueTypeRepository.save(tissueType);
    return HttpResponse.json(
      {
        data: {
          addTissueType: {
            ...tissueType
          }
        }
      },
      { status: 200 }
    );
  })
];
export default tissueTypeHandlers;
