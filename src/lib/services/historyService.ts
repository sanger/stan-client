import { stanCore } from '../sdk';
import { HistoryTableEntry } from '../../types/stan';
import { HistoryFieldsFragment, LabwareFieldsFragment, SampleFieldsFragment } from '../../types/sdk';
import { HistoryUrlParams } from '../../pages/History';

/**
 * Retrieves the history for the given History props.
 */
export async function findHistory(historyProps: HistoryUrlParams): Promise<Array<HistoryTableEntry>> {
  let result;
  let history: HistoryFieldsFragment = {
    entries: [],
    labware: [],
    samples: [],
    __typename: 'History'
  };
  if (historyProps.sampleId) {
    result = await stanCore.FindHistoryForSampleId({
      sampleId: Number(historyProps.sampleId)
    });
    history = result.historyForSampleId;
  } else {
    if (historyProps.workNumber || historyProps.barcode || historyProps.donorName || historyProps.externalName) {
      result = await stanCore.FindHistory({
        workNumber: historyProps.workNumber,
        barcode: historyProps.barcode,
        externalName: historyProps.externalName,
        donorName: historyProps.donorName
      });
      history = result.history;
    }
  }

  const labwareMap: Map<number, LabwareFieldsFragment> = new Map();
  const sampleMap: Map<number, SampleFieldsFragment> = new Map();

  history.labware.forEach((lw) => labwareMap.set(lw.id, lw));
  history.samples.forEach((sample) => sampleMap.set(sample.id, sample));

  return history.entries.map((entry) => {
    const sourceLabware = labwareMap.get(entry.sourceLabwareId)!;
    const destinationLabware = labwareMap.get(entry.destinationLabwareId)!;
    const sample = entry.sampleId ? sampleMap.get(entry.sampleId) : undefined;
    return {
      eventId: entry.eventId,
      date: new Date(entry.time).toLocaleDateString(),
      sourceBarcode: sourceLabware ? sourceLabware.barcode : '',
      destinationBarcode: destinationLabware ? destinationLabware.barcode : '',
      labwareType: destinationLabware.labwareType.name,
      sampleID: entry.sampleId,
      donorName: sample?.tissue?.donor?.donorName ?? undefined,
      externalName: sample?.tissue?.externalName ?? undefined,
      sectionNumber: sample?.section ?? undefined,
      eventType: entry.type,
      biologicalState: sample?.bioState?.name ?? undefined,
      labwareState: destinationLabware.state,
      username: entry.username,
      workNumber: entry.workNumber ?? undefined,
      details: entry.details,
      address: entry.address ?? undefined,
      sectionPosition: entry.region ?? undefined
    };
  });
}
