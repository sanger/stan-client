import { stanCore } from '../sdk';
import { HistoryProps, HistoryTableEntry } from '../../types/stan';
import {
  HistoryFieldsFragment,
  LabwareFieldsFragment,
  SampleFieldsFragment,
  SamplePositionFieldsFragment
} from '../../types/sdk';

/**
 * Retrieves the history for the given History props.
 */
export async function findHistory(historyProps: HistoryProps): Promise<Array<HistoryTableEntry>> {
  let result;
  let history: HistoryFieldsFragment;

  switch (historyProps.kind) {
    case 'sampleId':
      result = await stanCore.FindHistoryForSampleId({
        sampleId: historyProps.value
      });
      history = result.historyForSampleId;
      break;
    case 'externalName':
      result = await stanCore.FindHistoryForExternalName({
        externalName: historyProps.value
      });
      history = result.historyForExternalName;
      break;
    case 'donorName':
      result = await stanCore.FindHistoryForDonorName({
        donorName: historyProps.value
      });
      history = result.historyForDonorName;
      break;
    case 'labwareBarcode':
      result = await stanCore.FindHistoryForLabwareBarcode({
        barcode: historyProps.value
      });
      history = result.historyForLabwareBarcode;
      break;
    case 'workNumber':
      result = await stanCore.FindHistoryForWorkNumber({
        workNumber: historyProps.value
      });
      history = result.historyForWorkNumber;
      break;
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
      sourceBarcode: sourceLabware.barcode,
      destinationBarcode: destinationLabware.barcode,
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
