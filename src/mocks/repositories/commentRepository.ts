import { CommentFieldsFragment } from '../../types/sdk';
import { createSessionStorageRepository } from './index';
import commentFactory from '../../lib/factories/commentFactory';

const seeds: Array<CommentFieldsFragment> = [
  commentFactory.build({ text: 'Section Folded', category: 'section' }),
  commentFactory.build({ text: 'Poor section quality', category: 'section' }),
  commentFactory.build({ text: 'Sectioned well', category: 'section' }),
  commentFactory.build({ text: 'Section exploded', category: 'section' }),
  commentFactory.build({ text: 'This is good', category: 'blah' }),
  commentFactory.build({ text: 'Optimal', category: 'RNA analysis' }),
  commentFactory.build({ text: 'Potential to work', category: 'RNA analysis' }),
  commentFactory.build({
    text: ' Not recommended to proceed',
    category: 'RNA analysis'
  }),

  commentFactory.build({
    text: 'This is bad',
    category: 'blah',
    enabled: false
  }),
  commentFactory.build({ text: 'RIN number too low', category: 'Work status' }),
  commentFactory.build({
    text: 'Poor quality tissue',
    category: 'Work status'
  }),
  commentFactory.build({
    text: 'Waiting for reagents',
    category: 'Work status'
  }),
  commentFactory.build({
    text: 'Waiting for customer',
    category: 'Work status'
  }),
  commentFactory.build({
    category: 'stain QC',
    text: 'Slide damaged'
  }),
  commentFactory.build({
    category: 'stain QC',
    text: 'Wrong morphology'
  }),
  commentFactory.build({
    category: 'stain QC',
    text: 'Section invisible',
    enabled: false
  }),
  commentFactory.build({
    category: 'extract result',
    text: 'Technical error'
  }),
  commentFactory.build({
    category: 'extract result',
    text: 'Human error'
  }),
  commentFactory.build({
    category: 'extract result',
    text: 'No RNA detected'
  }),
  commentFactory.build({
    category: 'extract result',
    text: 'Extra-Terrestrial error',
    enabled: false
  }),
  commentFactory.build({
    category: 'Visium QC',
    text: 'Section invisible',
    enabled: false
  }),
  commentFactory.build({
    category: 'Visium QC',
    text: 'Wrong morphology for Visium'
  }),
  commentFactory.build({
    category: 'Visium QC',
    text: 'Slide damaged'
  }),
  commentFactory.build({
    category: 'Concentration',
    text: 'Potential to work'
  }),
  commentFactory.build({
    category: 'Concentration',
    text: 'Not recommended to proceed'
  }),
  commentFactory.build({
    category: 'Sample Processing',
    text: 'Issue while moving'
  }),
  commentFactory.build({
    category: 'Sample Processing',
    text: 'Labware damaged'
  }),
  commentFactory.build({
    category: 'Sample Processing',
    text: 'Issue while fixing'
  }),
  commentFactory.build({
    category: 'Sample Processing',
    text: 'Fixatives damaged'
  }),
  commentFactory.build({
    category: 'Paraffin processing program',
    text: 'Rapid biopsy'
  }),
  commentFactory.build({
    category: 'Paraffin processing program',
    text: 'Soft tissue'
  }),
  commentFactory.build({
    category: 'Paraffin processing program',
    text: 'Hard tissue'
  }),
  commentFactory.build({
    category: 'clean up',
    text: 'Difficult/very slow to separate'
  }),
  commentFactory.build({
    category: 'clean up',
    text: 'Bead loss during clean up'
  }),
  commentFactory.build({
    category: 'clean up',
    text: 'Carryover beads in final eluate transferred to new tube'
  }),
  commentFactory.build({
    category: 'clean up',
    text: 'Beads cracked during drying step'
  }),
  commentFactory.build({
    category: 'Xenium QC',
    text: 'Run terminated due to objective cleaning error'
  }),
  commentFactory.build({
    category: 'Xenium QC',
    text: 'Run terminated due to software error'
  }),
  commentFactory.build({
    category: 'Xenium QC',
    text: 'Run paused due to error, but retry permitted completion'
  }),
  commentFactory.build({
    category: 'Probe QC',
    text: 'Section detached'
  }),
  commentFactory.build({
    category: 'Probe QC',
    text: 'Issue with thermal cycler'
  }),
  commentFactory.build({
    category: 'Cell Segmentation',
    text: 'Looks good'
  }),
  commentFactory.build({
    category: 'Cell Segmentation',
    text: 'Not that good'
  }),
  commentFactory.build({
    category: 'Cell Segmentation',
    text: 'Looks very bad'
  })
];

const commentRepository = createSessionStorageRepository('COMMENTS', 'text', seeds);

export default commentRepository;
