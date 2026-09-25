import {
  BlockFormData,
  buildTissueBlockRequest,
  describeSourceChanges,
  pruneUnusedSourceChanges,
  TissueBlockLabwareForm
} from '../../../../src/components/originalSampleProcessing/blockProcessing/BlockProcessing';

const tubePlan = (sourceBarcode: string, sourceSampleId: number): TissueBlockLabwareForm => ({
  labwareType: 'Tube',
  contents: [
    {
      sourceBarcode,
      sourceSampleId,
      addresses: ['A1'],
      replicate: '1',
      externalId: `EXT-${sourceSampleId}`,
      isEditReplicateDisabled: false
    }
  ]
});

// STAN-100 holds samples 1, 2 and 3; samples 1 and 2 are used to make blocks. STAN-200 holds sample 4, used for a block.
const formData = (formData: Partial<BlockFormData> = {}): BlockFormData => ({
  workNumber: 'SGP1',
  plans: new Map([
    ['plan1', tubePlan('STAN-100', 1)],
    ['plan2', tubePlan('STAN-100', 2)],
    ['plan3', tubePlan('STAN-200', 4)]
  ]),
  ...formData
});

describe('buildTissueBlockRequest', () => {
  it('strips form-only fields from the block contents', () => {
    const request = buildTissueBlockRequest(formData());
    expect(request.workNumber).toEqual('SGP1');
    expect(request.labware).toHaveLength(3);
    expect(request.labware[0].contents).toEqual([
      { sourceBarcode: 'STAN-100', sourceSampleId: 1, addresses: ['A1'], replicate: '1' }
    ]);
  });

  describe('when nothing is discarded or removed', () => {
    it('sends empty discard and remove lists', () => {
      const request = buildTissueBlockRequest(formData());
      expect(request.discardSourceBarcodes).toEqual([]);
      expect(request.removedSourceSampleIds).toEqual([]);
    });
  });

  describe('when a source is discarded', () => {
    it('sends only the barcodes ticked for discard', () => {
      const request = buildTissueBlockRequest(formData({ discardSources: { 'STAN-100': false, 'STAN-200': true } }));
      expect(request.discardSourceBarcodes).toEqual(['STAN-200']);
      expect(request.removedSourceSampleIds).toEqual([]);
    });

    it('drops the discard of a source that is not used to make a block', () => {
      const request = buildTissueBlockRequest(formData({ discardSources: { 'STAN-200': true, 'STAN-300': true } }));
      expect(request.discardSourceBarcodes).toEqual(['STAN-200']);
    });
  });

  describe('when samples are removed from a source', () => {
    it('sends each selected sample with its source barcode', () => {
      const request = buildTissueBlockRequest(formData({ removedSamples: { 'STAN-100': [1, 2], 'STAN-200': [4] } }));
      expect(request.discardSourceBarcodes).toEqual([]);
      expect(request.removedSourceSampleIds).toEqual([
        { barcode: 'STAN-100', sampleId: 1 },
        { barcode: 'STAN-100', sampleId: 2 },
        { barcode: 'STAN-200', sampleId: 4 }
      ]);
    });
  });

  describe('when a source is both discarded and has samples removed', () => {
    it('sends the discard and drops the removals for that source', () => {
      const request = buildTissueBlockRequest(
        formData({ discardSources: { 'STAN-100': true }, removedSamples: { 'STAN-100': [1], 'STAN-200': [4] } })
      );
      expect(request.discardSourceBarcodes).toEqual(['STAN-100']);
      expect(request.removedSourceSampleIds).toEqual([{ barcode: 'STAN-200', sampleId: 4 }]);
    });
  });

  describe('when a selected sample is no longer used to make a block', () => {
    it('drops the removal for that sample', () => {
      const data = formData({ removedSamples: { 'STAN-100': [1, 2, 3] } });
      data.plans.delete('plan2');
      const request = buildTissueBlockRequest(data);
      expect(request.removedSourceSampleIds).toEqual([{ barcode: 'STAN-100', sampleId: 1 }]);
    });
  });
});

describe('pruneUnusedSourceChanges', () => {
  it('keeps discards and removals of sources that are used to make a block', () => {
    const data = formData({ discardSources: { 'STAN-200': true }, removedSamples: { 'STAN-100': [1, 2] } });
    expect(pruneUnusedSourceChanges(data)).toEqual({
      discardSources: { 'STAN-200': true },
      removedSamples: { 'STAN-100': [1, 2] }
    });
  });

  it('drops discards and removals of sources that are no longer used to make a block', () => {
    const data = formData({ discardSources: { 'STAN-200': true }, removedSamples: { 'STAN-100': [1, 2, 3] } });
    data.plans.delete('plan2');
    data.plans.delete('plan3');
    expect(pruneUnusedSourceChanges(data)).toEqual({
      discardSources: { 'STAN-200': false },
      removedSamples: { 'STAN-100': [1] }
    });
  });

  it('returns empty selections when nothing is selected', () => {
    expect(pruneUnusedSourceChanges(formData())).toEqual({ discardSources: {}, removedSamples: {} });
  });
});

describe('describeSourceChanges', () => {
  it('describes nothing when no source is discarded or has samples removed', () => {
    expect(describeSourceChanges(formData())).toEqual([]);
  });

  it('describes discarded sources and removed samples by external id', () => {
    expect(
      describeSourceChanges(formData({ discardSources: { 'STAN-200': true }, removedSamples: { 'STAN-100': [1, 2] } }))
    ).toEqual(['Labware STAN-200 will be discarded', 'Samples EXT-1, EXT-2 will be removed from labware STAN-100']);
  });

  it('describes what is requested, not ignored selections', () => {
    expect(
      describeSourceChanges(
        formData({ discardSources: { 'STAN-100': true }, removedSamples: { 'STAN-100': [1], 'STAN-200': [4, 5] } })
      )
    ).toEqual(['Labware STAN-100 will be discarded', 'Sample EXT-4 will be removed from labware STAN-200']);
  });

  it('falls back to the sample id when a sample has no external id', () => {
    const data = formData({ removedSamples: { 'STAN-100': [1] } });
    data.plans.get('plan1')!.contents[0].externalId = '';
    expect(describeSourceChanges(data)).toEqual(['Sample id 1 will be removed from labware STAN-100']);
  });
});
