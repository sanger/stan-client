import React from 'react';
import { ProbeLot, ProbeOperationLabware, ProbePanelFieldsFragment } from '../../types/sdk';
import { Row } from 'react-table';
import DataTable from '../../components/DataTable';
import RemoveButton from '../buttons/RemoveButton';
import IconButton from '../buttons/IconButton';
import AddIcon from '../icons/AddIcon';
import probeLotColumns from './ProbeTableColumns';
import { FieldArray } from 'formik';

type ProbeTableProps = {
  probePanels: ProbePanelFieldsFragment[];
  probeLabware: { barcode: string; workNumber: string; probes: Array<{ panel: string; lot: string; plex: number }> };
  labwareIndex: number;
};
const ProbeTable: React.FC<ProbeTableProps> = ({ probeLabware, probePanels, labwareIndex }) => {
  // Column with delete and add action to remove and add to the end of the probe data columns passed in
  const actionColumns = React.useMemo(() => {
    return {
      Header: '',
      id: 'remove',
      Cell: ({ row }: { row: Row<{ panel: string; lot: string; plex: number }> }) => {
        return (
          <div className={'flex flex-row space-x-2'}>
            {row.index === 0 && probeLabware.probes.length === 1 ? (
              <></>
            ) : (
              <FieldArray name={`labware.${labwareIndex}.probes`}>
                {(helpers) => (
                  <RemoveButton
                    type={'button'}
                    onClick={() => {
                      //probeLabware.probes.splice(row.index, 1);
                      helpers.remove(row.index);
                    }}
                  />
                )}
              </FieldArray>
            )}
            {row.index === probeLabware.probes.length - 1 && (
              <FieldArray name={`labware.${labwareIndex}.probes`}>
                {(helpers) => (
                  <IconButton
                    data-testid={`probesAdd`}
                    onClick={() => {
                      helpers.push({ name: '', lot: '', plex: -1 });
                    }}
                    className={'focus:outline-none'}
                  >
                    <AddIcon className="inline-block text-green-500 h-5 w-5 -ml-1 mr-2" />
                  </IconButton>
                )}
              </FieldArray>
            )}
          </div>
        );
      }
    };
  }, [probeLabware]);

  return (
    <DataTable
      columns={[...probeLotColumns(probePanels, `labware.${labwareIndex}.probes`), actionColumns]}
      data={probeLabware.probes}
    />
  );
};

export default ProbeTable;
