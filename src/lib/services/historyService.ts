import { stanCore } from '../sdk';
import { HistoryTableEntry } from '../../types/stan';
import { HistoryFieldsFragment, LabwareFieldsFragment, SampleFieldsFragment } from '../../types/sdk';
import { HistoryUrlParams } from '../../pages/History';
import { omit } from 'lodash';

/**
 * Retrieves the history for the given History props.
 */

const initHistory: HistoryFieldsFragment = {
  entries: [],
  labware: [],
  samples: [],
  flaggedBarcodes: [],
  __typename: 'History'
};

export type HistoryService = {
  history: {
    entries: Array<HistoryTableEntry>;
    flaggedBarcodes: Array<string>;
  };
  historyGraph?: string;
  zoom?: number;
  fontSize?: number;
};

export const buildHistoryEntries = (history: HistoryFieldsFragment): Array<HistoryTableEntry> => {
  const labwareMap: Map<number, LabwareFieldsFragment> = new Map();
  const sampleMap: Map<number, SampleFieldsFragment> = new Map();

  history.labware.forEach((lw) => labwareMap.set(lw.id, lw));
  history.samples.forEach((sample) => sampleMap.set(sample.id, sample));

  const entries = history.entries.map((entry) => {
    const sourceLabware = labwareMap.get(entry.sourceLabwareId)!;
    const destinationLabware = labwareMap.get(entry.destinationLabwareId)!;
    const sample = entry.sampleId ? sampleMap.get(entry.sampleId) : undefined;
    return {
      eventId: entry.eventId,
      date: entry.time,
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
  return entries;
};

export async function findHistory(historyProps: HistoryUrlParams): Promise<HistoryService> {
  let result;
  let history: HistoryFieldsFragment = initHistory;
  let historyGraph: string | undefined;
  let zoom: number = 1;
  let fontSize: number = 16;
  if (
    historyProps.resultFormat === 'graph' &&
    (historyProps.workNumber || historyProps.barcode || historyProps.donorName || historyProps.externalName)
  ) {
    result = await stanCore.FindHistoryGraph({
      ...omit(historyProps, ['resultFormat']),
      zoom: historyProps.zoom || 1,
      fontSize: historyProps.fontSize || 16
    });
    historyGraph = result.historyGraph.svg;
    history = initHistory;
    zoom = historyProps.zoom || zoom;
    fontSize = historyProps.fontSize || fontSize;
  } else {
    if (historyProps.sampleId) {
      result = await stanCore.FindHistoryForSampleId({
        sampleId: Number(historyProps.sampleId)
      });
      history = result.historyForSampleId;
    } else {
      if (
        historyProps.workNumber ||
        historyProps.barcode ||
        historyProps.donorName ||
        historyProps.externalName ||
        historyProps.eventType
      ) {
        result = await stanCore.FindHistory({
          workNumber: historyProps.workNumber,
          barcode: historyProps.barcode,
          externalName: historyProps.externalName?.split(','),
          donorName: historyProps.donorName?.split(','),
          eventType: historyProps.eventType
        });
        history = result.history;
        historyGraph = undefined;
      }
    }
  }

  return {
    history: {
      entries: buildHistoryEntries(history),
      flaggedBarcodes: history.flaggedBarcodes
    },
    historyGraph,
    fontSize,
    zoom
  };
}
