import { graphql, HttpResponse } from 'msw';
import {
  AddBioRiskMutation,
  AddBioRiskMutationVariables,
  GetBioRisksQuery,
  GetBioRisksQueryVariables,
  SetBioRiskEnabledMutation,
  SetBioRiskEnabledMutationVariables
} from '../../types/sdk';
import { isEnabled } from '../../lib/helpers';
import BioRiskRepository from '../repositories/bioRiskRepository';
import bioRiskRepository from '../repositories/bioRiskRepository';
import bioRiskFactory from '../../lib/factories/bioRiskFactory';

const bioRiskHandler = [
  graphql.mutation<AddBioRiskMutation, AddBioRiskMutationVariables>('AddBioRisk', ({ variables }) => {
    const bioRisk = bioRiskFactory.build({
      code: variables.code
    });
    bioRiskRepository.save(bioRisk);
    return HttpResponse.json({ data: { addBioRisk: bioRisk } }, { status: 200 });
  }),

  graphql.mutation<SetBioRiskEnabledMutation, SetBioRiskEnabledMutationVariables>(
    'SetBioRiskEnabled',
    ({ variables }) => {
      const comment = bioRiskRepository.find('code', variables.code);
      if (comment) {
        comment.enabled = variables.enabled;
        bioRiskRepository.save(comment);
        return HttpResponse.json({ data: { setBioRiskEnabled: comment } }, { status: 200 });
      } else {
        return HttpResponse.json(
          { errors: [{ message: `Could not find comment: "${variables.code}"` }] },
          { status: 404 }
        );
      }
    }
  ),

  graphql.query<GetBioRisksQuery, GetBioRisksQueryVariables>('GetBioRisks', ({ variables }) => {
    return HttpResponse.json(
      {
        data: {
          bioRisks: BioRiskRepository.findAll().filter((bioRisk) => variables.includeDisabled || isEnabled(bioRisk))
        }
      },
      { status: 200 }
    );
  })
];

export default bioRiskHandler;
