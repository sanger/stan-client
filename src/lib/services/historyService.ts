import { stanCore } from '../sdk';
import { HistoryTableEntry } from '../../types/stan';
import {
  HistoryFieldsFragment,
  LabwareFieldsFragment,
  SampleFieldsFragment,
  SamplePositionFieldsFragment
} from '../../types/sdk';
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
    samplePositionResults: [],
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
  const samplePositionMapByOpId: Map<number, Map<number, SamplePositionFieldsFragment>> = new Map();

  history.labware.forEach((lw) => labwareMap.set(lw.id, lw));
  history.samples.forEach((sample) => sampleMap.set(sample.id, sample));
  history.samplePositionResults.forEach((samplePosition) => {
    const operationId = samplePosition.operationId;
    const sampleId = samplePosition.sampleId;

    if (!samplePositionMapByOpId.has(operationId)) {
      samplePositionMapByOpId.set(operationId, new Map());
    }
    samplePositionMapByOpId.get(operationId)?.set(sampleId, samplePosition);
  });
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
      address: samplePositionMapByOpId.get(entry.eventId)?.get(entry.sampleId as number)?.address,
      sectionPosition: samplePositionMapByOpId.get(entry.eventId)?.get(entry.sampleId as number)?.region
    };
  });
}
