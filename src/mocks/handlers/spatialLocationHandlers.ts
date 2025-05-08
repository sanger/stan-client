import { graphql, HttpResponse } from 'msw';
import { AddSpatialLocationsMutation, AddSpatialLocationsMutationVariables } from '../../types/sdk';
import tissueTypeRepository, { spatialLocationRepo } from '../repositories/tissueTypeRepository';
import { spatialLocationFactory } from '../../lib/factories/sampleFactory';

const spatialLocationHandlers = [
  graphql.mutation<AddSpatialLocationsMutation, AddSpatialLocationsMutationVariables>(
    'AddSpatialLocations',
    ({ variables }) => {
      const tissueType = tissueTypeRepository.find('name', variables.request.name);

      if (!tissueType) {
        return HttpResponse.json(
          { errors: [{ message: `Tissue type ${variables.request.name} not found` }] },
          { status: 404 }
        );
      }

      variables.request.spatialLocations.forEach((spatialLocation) => {
        const existingSpatialLocation = tissueType.spatialLocations.find(
          (existing) => existing.name === spatialLocation.name
        );

        if (existingSpatialLocation) {
          return HttpResponse.json(
            { errors: [{ message: `Spatial location ${spatialLocation.name} already exists` }] },
            { status: 400 }
          );
        }
        const existingCode = tissueType.spatialLocations.find((existing) => existing.code === spatialLocation.code);
        if (existingCode) {
          return HttpResponse.json(
            { errors: [{ message: `Spatial location ${spatialLocation.name} already exists` }] },
            { status: 400 }
          );
        }
      });

      const spatialLocations = variables.request.spatialLocations.map((spatialLocation) => {
        return spatialLocationFactory.build({
          name: spatialLocation.name,
          code: spatialLocation.code,
          tissueType
        });
      });

      spatialLocationRepo.saveAll(spatialLocations);
      return HttpResponse.json(
        {
          data: {
            addSpatialLocations: {
              name: tissueType.name,
              spatialLocations
            }
          }
        },
        { status: 200 }
      );
    }
  )
];
export default spatialLocationHandlers;
