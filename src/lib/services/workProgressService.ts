import {
  FindWorkProgressQuery,
  FindWorkProgressQueryVariables,
  WorkStatus,
} from "../../types/sdk";
import { SearchResultsType } from "../../types/stan";
import _ from "lodash";
import { stanCore } from "../sdk";
import { SearchServiceInterface } from "./searchServiceInterface";
import { Column } from "react-table";

/**
 * A single row on the results table of the Work Progress page
 */
export type WorkProgressResultTableEntry = {
  priority: string | undefined;
  workNumber: string;
  workType: string;
  project: string;
  status: WorkStatus;
  lastSectionDate: Date | undefined;
  lastStainingDate: Date | undefined;
  lastRNAExtractionDate: Date | undefined;
  lastCDNADate: Date | undefined;
  lastRNAScopeIHCStainDate: Date | undefined;
  lastSlideImagedDate: Date | undefined;
  lastRNAAnalysisDate: Date | undefined;
  lastVisiumADHStainDate: Date | undefined;
  lastStainTODate: Date | undefined;
  lastStainLPDate: Date | undefined;
  lastRelease96WellPlateData: Date | undefined;
};
/**
 * The keys to store the timestamp data
 */
export type WorkProgressTimeStampType =
  | "Section"
  | "Stain"
  | "Extract"
  | "Visium cDNA"
  | "Stain Visium TO"
  | "RNAscope/IHC stain"
  | "Visium ADH H&E stain"
  | "Stain Visium LP"
  | "Image"
  | "Release 96 well plate"
  | "Analysis";

export class WorkProgressService
  implements
    SearchServiceInterface<
      FindWorkProgressQueryVariables,
      WorkProgressResultTableEntry
    > {
  /**
   * Do a findWorkProgress query on core. Format the response into a list of table rows
   * @param workProgressRequest the variables that go into a FindWorkProgress query
   */
  search = async (
    workProgressRequest: FindWorkProgressQueryVariables
  ): Promise<SearchResultsType<WorkProgressResultTableEntry>> => {
    // Tidy up the search parameters e.g. removing undefined and null values
    const request: FindWorkProgressQueryVariables = _(workProgressRequest)
      .omitBy((val) => (typeof val === "number" ? val === 0 : _.isEmpty(val)))
      .mapValues((value: any) =>
        typeof value === "string" ? value.trim() : value
      )
      .value();

    const response = await stanCore.FindWorkProgress(request);
    return {
      numDisplayed: response.workProgress.entries.length,
      entries: this.formatFindResult(response.workProgress),
    };
  };

  /**
   * Convert the result of a FindWorkProgress query into data for the table rows
   * @param findResult the result of the findWorkProgress on core
   */
  formatFindResult = (
    findResult?: FindWorkProgressQuery["workProgress"]
  ): WorkProgressResultTableEntry[] => {
    if (!findResult) {
      return [];
    }

    return findResult.map((entry) => {
      const timeStampMap = new Map<WorkProgressTimeStampType, String>();
      entry.timestamps.forEach((timeStamp) => {
        timeStampMap.set(
          timeStamp.type as WorkProgressTimeStampType,
          timeStamp.timestamp
        );
      });
      const lastSectionDate = timeStampMap.get("Section");
      const lastStainingDate = timeStampMap.get("Stain");
      const lastRNAExtractionDate = timeStampMap.get("Extract");
      const lastCDNADate = timeStampMap.get("Visium cDNA");
      const lastStainVisiumTODate = timeStampMap.get("Stain Visium TO");
      const lastStainVisiumLPDate = timeStampMap.get("Stain Visium LP");
      const lastRNAScopeIHCStainDate = timeStampMap.get("RNAscope/IHC stain");
      const lastVisiumADHStainDate = timeStampMap.get("Visium ADH H&E stain");
      const lastSlideImagedDate = timeStampMap.get("Image");
      const lastRNAAnalysisDate = timeStampMap.get("Analysis");
      const lastRelease96WellPlateData = timeStampMap.get(
        "Release 96 well plate"
      );
      return {
        priority: entry.work.priority ?? undefined,
        workNumber: entry.work.workNumber,
        workType: entry.work.workType.name,
        project: entry.work.project.name,
        status: entry.work.status,
        lastSectionDate:
          lastSectionDate && new Date(lastSectionDate.toString()),
        lastStainingDate:
          lastStainingDate && new Date(lastStainingDate.toString()),
        lastRNAExtractionDate:
          lastRNAExtractionDate && new Date(lastRNAExtractionDate.toString()),
        lastCDNADate: lastCDNADate && new Date(lastCDNADate.toString()),
        lastStainTODate:
          lastStainVisiumTODate && new Date(lastStainVisiumTODate.toString()),
        lastStainLPDate:
          lastStainVisiumLPDate && new Date(lastStainVisiumLPDate.toString()),
        lastRNAScopeIHCStainDate:
          lastRNAScopeIHCStainDate &&
          new Date(lastRNAScopeIHCStainDate.toString()),
        lastRNAAnalysisDate:
          lastRNAAnalysisDate && new Date(lastRNAAnalysisDate.toString()),
        lastVisiumADHStainDate:
          lastVisiumADHStainDate && new Date(lastVisiumADHStainDate.toString()),
        lastSlideImagedDate:
          lastSlideImagedDate && new Date(lastSlideImagedDate.toString()),
        lastRelease96WellPlateData:
          lastRelease96WellPlateData &&
          new Date(lastRelease96WellPlateData.toString()),
      };
    });
  };
}
/**
 * Creates the content for a workprogress export file
 *
 * @param columns list of columns to build. Note that the columns must have their {@code Header}
 *        and {@code accessor} (as a string) set
 * @param entries the data to go into the file
 * @param delimiter (optional) the column delimiter
 */
export function createWorkProgressFileContent(
  columns: Array<Column<WorkProgressResultTableEntry>>,
  entries: Array<WorkProgressResultTableEntry>,
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
