import { SetStateAction } from 'react';
import { LabwareFlaggedFieldsFragment, Sdk } from '../../types/sdk';
import { sectionGroupsBySample } from '../../lib/helpers/labwareHelper';
import { hasUploadedFilesInSgpFolder } from '../../lib/services/fileService';
import { AnalyserLabwareForm, AnalyserScanFormValues, Region } from './analyser.types';

/**
 * Builds a list of labware regions.
 * Initially, each section group is assigned to its own region.
 */
export const labwareRegions = (lw: LabwareFlaggedFieldsFragment): Array<Region> => {
  const sectionGroups = sectionGroupsBySample(lw);
  return Object.values(sectionGroups).map((sectionGroup, index) => ({
    roi: sectionGroup.source.tissue?.externalName ?? `Region${index + 1}`,
    sectionGroups: [sectionGroup]
  }));
};

/**This creates the slot related information for the labware */
export const createTableDataForSlots = <T extends AnalyserScanFormValues>(
  stanCore: Sdk,
  probeHybridisationOperationType: string,
  labware: LabwareFlaggedFieldsFragment,
  setValues: (values: SetStateAction<T>, shouldValidate?: boolean) => {},
  values: T
) => {
  const setLabwareSampleData = async (lw: LabwareFlaggedFieldsFragment) => {
    try {
      /**Check if the images were been uploaded to the sgp folder**/
      const hasSgpNumberLink =
        values.workNumberAll.length > 0 ? await hasUploadedFilesInSgpFolder(values.workNumberAll) : false;
      /**Validate whether probe hybridisation has been recorded on this labware**/
      const latestOp = await stanCore
        .FindLatestOperation({ barcode: lw.barcode, operationType: probeHybridisationOperationType })
        .then((res) => res.findLatestOp);
      /**If probe hybridisation has been recorded, get the sample positions,otherwise return**/
      if (latestOp) {
        stanCore.GetAnalyserScanData({ barcode: labware.barcode }).then((res) => {
          setValues((prev) => {
            const analyserLabware: AnalyserLabwareForm | undefined = prev.labware.find(
              (lw) => lw.labware.barcode === labware.barcode
            );
            if (analyserLabware) {
              analyserLabware.analyserScanData = res.analyserScanData;
            } else {
              prev.labware.push({
                labware,
                hybridisation: true,
                workNumber: values.workNumberAll,
                hasSgpNumberLink,
                position: undefined,
                regions: labwareRegions(labware),
                analyserScanData: res.analyserScanData
              });
            }
            return { ...prev };
          });
        });
      } else {
        setValues((prev) => {
          prev.labware.push({
            labware,
            hybridisation: false,
            workNumber: values.workNumberAll,
            hasSgpNumberLink,
            position: undefined,
            regions: labwareRegions(labware)
          });
          return { ...prev };
        });
        return;
      }
    } catch (e) {
      return;
    }
  };
  setLabwareSampleData(labware);
};
