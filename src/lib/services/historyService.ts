import { stanCore } from "../sdk";
import { HistoryProps, HistoryTableEntry } from "../../types/stan";
import {
  HistoryFieldsFragment,
  LabwareFieldsFragment,
  SampleFieldsFragment,
} from "../../types/sdk";
import { Column } from "react-table";

/**
 * Retrieves the history for the given History props.
 */
export async function findHistory(
  historyProps: HistoryProps
): Promise<Array<HistoryTableEntry>> {
  let result;
  let history: HistoryFieldsFragment;

  switch (historyProps.kind) {
    case "sampleId":
      result = await stanCore.FindHistoryForSampleId({
        sampleId: historyProps.value,
      });
      history = result.historyForSampleId;
      break;
    case "externalName":
      result = await stanCore.FindHistoryForExternalName({
        externalName: historyProps.value,
      });
      history = result.historyForExternalName;
      break;
    case "donorName":
      result = await stanCore.FindHistoryForDonorName({
        donorName: historyProps.value,
      });
      history = result.historyForDonorName;
      break;
    case "labwareBarcode":
      result = await stanCore.FindHistoryForLabwareBarcode({
        barcode: historyProps.value,
      });
      history = result.historyForLabwareBarcode;
      break;
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
      date: new Date(entry.time).toLocaleDateString(),
      sourceBarcode: sourceLabware.barcode,
      destinationBarcode: destinationLabware.barcode,
      sampleID: entry.sampleId,
      externalName: sample?.tissue?.externalName ?? undefined,
      sectionNumber: sample?.section ?? undefined,
      eventType: entry.type,
      biologicalState: sample?.bioState?.name ?? undefined,
      labwareState: destinationLabware.state,
      details: entry.details,
    };
  });
}

/**
 * Creates the content for a history export file
 *
 * @param columns list of columns to build. Note that the columns must have their {@code Header}
 *        and {@code accessor} (as a string) set
 * @param entries the data to go into the file
 * @param delimiter (optional) the column delimiter
 */
export function createHistoryFileContent(
  columns: Array<Column<HistoryTableEntry>>,
  entries: Array<HistoryTableEntry>,
  delimiter?: string
): string {
  if (!delimiter) {
    delimiter = "\t";
  }
  const columnNameRow = columns.map((column) => column.Header).join(delimiter);

  const rows = entries
    .map((entry) => {
      return columns
        .map((column) => {
          if (typeof column.accessor === "string") {
            return entry[column.accessor];
          }
          throw new Error(
            "createHistoryFileContent requires all column accessors to be strings"
          );
        })
        .join(delimiter);
    })
    .join("\n");

  return `${columnNameRow}\n${rows}`;
}
