import { Column } from 'react-table';
import React from 'react';
import { useDownload } from '../../lib/hooks/useDownload';
import DownloadIcon from '../icons/DownloadIcon';
import { SectionMetricData } from '../../pages/XeniumMetrics';

type RoiTableDownloaderProps = {
  data: Array<SectionMetricData>;
  barcode: string;
};

type TaleDataRow = {
  roi: string;
  externalId: string;
  sectionNumber: number;
  addresses: string;
};

const RoiTableDownloader = ({ barcode, data }: RoiTableDownloaderProps) => {
  const dataEntries: Array<TaleDataRow> = React.useMemo(() => {
    return data.flatMap((row) => {
      return row.sectionGroups.map((sectionGroup) => {
        return {
          roi: row.roi,
          externalId: sectionGroup.source.tissue?.externalName ?? '',
          sectionNumber: sectionGroup.source.newSection ?? 0,
          addresses: Array.from(sectionGroup.addresses).join(', ')
        };
      });
    });
  }, [data]);
  const columns: Array<Column<TaleDataRow>> = React.useMemo(() => {
    return [
      {
        Header: 'Region of interest',
        accessor: 'roi'
      },
      {
        Header: 'External ID',
        accessor: 'externalId'
      },
      {
        Header: 'Section Number',
        accessor: 'sectionNumber'
      },
      {
        Header: 'Address(es)',
        accessor: 'addresses'
      }
    ];
  }, []);
  const downloadData = React.useMemo(() => {
    return {
      columnData: {
        columns
      },
      entries: dataEntries
    };
  }, [columns, dataEntries]);
  const { downloadURL, extension } = useDownload(downloadData);

  return (
    <div className="mt-6 mb-2 flex flex-row items-center justify-end space-x-3">
      <p className="text-sm text-gray-700">Regions Of Interest Table</p>
      <a href={downloadURL} download={`${barcode}_rois_table.${extension}`}>
        <DownloadIcon name="Download" className="h-4 w-4 text-sdb" />
      </a>
    </div>
  );
};

export default RoiTableDownloader;
