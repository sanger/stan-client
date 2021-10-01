import {
  FindWorkProgressQuery,
  FindWorkProgressQueryVariables,
  WorkStatus,
} from "../../types/sdk";
import { GenericSearchResultsType } from "../../types/stan";
import _ from "lodash";
import { stanCore } from "../sdk";
import { GenericSearchService } from "./genericSearchService";

/**
 * The overriden result for WorkProgress
 */
export type WorkProgressResultsType = GenericSearchResultsType & {
  entries: WorkProgressResultTableEntry[];
};

/**
 * A single row on the results table of the Work Progress page
 */
export type WorkProgressResultTableEntry = {
  workNumber: string;
  status: WorkStatus;
  lastSectionDate: Date | undefined;
  lastStainingDate: Date | undefined;
  lastRNAExtractionDate: Date | undefined;
  lastCDNADate: Date | undefined;
};
/**
 * The keys to store the timestamp data
 */
export type WorkProgressTimeStampType =
  | "Section"
  | "Stain"
  | "Extract"
  | "Visium cDNA";

export class WorkProgressService implements GenericSearchService {
  /**
   * Do a findWorkProgress query on core. Format the response into a list of table rows
   * @param workProgressRequest the variables that go into a FindWorkProgress query
   */
  search = async (
    workProgressRequest: FindWorkProgressQueryVariables
  ): Promise<WorkProgressResultsType> => {
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
      return {
        workNumber: entry.work.workNumber,
        status: entry.work.status,
        lastSectionDate:
          lastSectionDate && new Date(lastSectionDate.toString()),
        lastStainingDate:
          lastStainingDate && new Date(lastStainingDate.toString()),
        lastRNAExtractionDate:
          lastRNAExtractionDate && new Date(lastRNAExtractionDate.toString()),
        lastCDNADate: lastCDNADate && new Date(lastCDNADate.toString()),
      };
    });
  };
}
