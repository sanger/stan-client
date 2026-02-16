import DataTable from '../DataTable';
import { Column, Row } from 'react-table';
import React from 'react';
import { LabwareFlaggedFieldsFragment, RoiFieldsFragment } from '../../types/sdk';
import { alphaNumericSortDefault } from '../../types/stan';
import { sectionGroupsBySample } from '../../lib/helpers/labwareHelper';
import { PlannedSectionDetails } from '../../lib/machines/layout/layoutContext';

export type RoiTableRow = {
  roi: string;
  sectionGroups: Array<PlannedSectionDetails>;
};

export type RoiTableProps<T extends RoiFieldsFragment> = {
  actionColumn: Column<T>;
  data: RoiTableRow[];
};

export const groupRoisByRegionName = (rois: RoiFieldsFragment[]): Record<string, RoiFieldsFragment[]> => {
  return rois
    .sort((a, b) => alphaNumericSortDefault(a.address, b.address))
    .reduce(
      (acc, data) => {
        const roiGroup = acc[data.roi] || (acc[data.roi] = []);
        if (!roiGroup.some((item) => item.address === data.address && item.sample.id === data.sample.id)) {
          roiGroup.push(data);
        }
        return acc;
      },
      {} as Record<string, RoiFieldsFragment[]>
    );
};

export type RoiSectionGroup = {
  roi: string;
  sectionGroup: Array<PlannedSectionDetails>;
};

/**
 * Maps The grouped ROIs to their corresponding section groups in labware
 */
export const mapRoisToSectionGroups = (
  labware: LabwareFlaggedFieldsFragment,
  rois: RoiFieldsFragment[]
): Record<string, RoiSectionGroup> => {
  const sectionGroups = Object.values(sectionGroupsBySample(labware));
  const groupedByRoi: Record<string, RoiFieldsFragment[]> = groupRoisByRegionName(rois);
  const roiSectionsMap: Record<string, RoiSectionGroup> = {};
  const addedAddresses: Set<string> = new Set();

  Object.values(groupedByRoi).forEach((roiList) => {
    roiList.forEach((group) => {
      const matchingSectionGroup = sectionGroups.find((sectionGroup) => {
        return (
          sectionGroup.source.sampleId === group.sample.id &&
          sectionGroup.addresses.has(group.address) &&
          !addedAddresses.has(group.address)
        );
      });
      if (matchingSectionGroup) {
        matchingSectionGroup.addresses.forEach((addresses) => {
          addedAddresses.add(addresses);
        });
        roiSectionsMap[group.roi] = roiSectionsMap[group.roi] || { roi: group.roi, sectionGroup: [] };
        roiSectionsMap[group.roi].sectionGroup.push(matchingSectionGroup);
      }
    });
  });
  return roiSectionsMap;
};
const RoiTable = ({ actionColumn, data }: RoiTableProps<any>) => {
  return (
    <DataTable
      columns={[
        {
          Header: 'Region of interest',
          accessor: 'roi'
        },
        {
          Header: 'External ID',
          Cell: ({ row }: { row: Row<RoiTableRow> }) => {
            return (
              <div className="grid grid-cols-1">
                {row.original.sectionGroups.map((section, index) => {
                  return (
                    <label className="py-1" key={`externalName-${index}`}>
                      {section.source.tissue?.externalName}
                    </label>
                  );
                })}
              </div>
            );
          }
        },
        {
          Header: 'Section Number',
          Cell: ({ row }: { row: Row<RoiTableRow> }) => {
            return (
              <div className="grid grid-cols-1 text-wrap">
                {row.original.sectionGroups.map((section, index) => {
                  return (
                    <label className="py-1" key={`section-${index}`}>
                      {section.source.newSection}
                    </label>
                  );
                })}
              </div>
            );
          }
        },
        {
          Header: 'Address(es)',
          Cell: ({ row }: { row: Row<RoiTableRow> }) => {
            return (
              <div className="grid grid-cols-1 text-wrap">
                {row.original.sectionGroups.map((section, index) => {
                  return (
                    <label className="py-1" key={`addresses-${index}`}>
                      {Array.from(section.addresses).join(', ')}
                    </label>
                  );
                })}
              </div>
            );
          }
        },
        actionColumn as Column<RoiTableRow>
      ]}
      data={data}
    />
  );
};

export default RoiTable;
