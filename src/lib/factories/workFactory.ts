import { Factory } from 'fishery';
import { WorkFieldsFragment, WorkStatus } from '../../types/sdk';
import costCodeFactory from './costCodeFactory';
import projectFactory from './projectFactory';
import workTypeFactory from './workTypeFactory';
import releaseRecipientFactory from './releaseRecipientFactory';
import programFactory from './programFactory';
import omeroProjectFactory from './omeroProjectFactory';

export default Factory.define<WorkFieldsFragment, { isRnD: boolean }>(
  ({ params, sequence, associations, transientParams }) => {
    let workNumber: string;
    if (params.workNumber) {
      workNumber = params.workNumber;
    } else {
      workNumber = transientParams.isRnD ? `R&D${sequence + 1000}` : `SGP${sequence + 1000}`;
    }

    return {
      __typename: 'Work',
      workType: associations.workType ?? workTypeFactory.build(),
      workRequester: associations.workRequester ?? releaseRecipientFactory.build(),
      costCode: associations.costCode ?? costCodeFactory.build(),
      project: associations.project ?? projectFactory.build(),
      program: associations.program ?? programFactory.build(),
      status: params.status ?? WorkStatus.Unstarted,
      numBlocks: params.numBlocks,
      numSlides: params.numSlides,
      numOriginalSamples: params.numOriginalSamples,
      workNumber: workNumber,
      omeroProject: associations.omeroProject ?? omeroProjectFactory.build()
    };
  }
);
