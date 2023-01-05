import React from 'react';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../../components/Table';
import IconButton from '../../components/buttons/IconButton';
import AddIcon from '../../components/icons/AddIcon';
import BlueButton from '../../components/buttons/BlueButton';
import Panel from '../../components/Panel';
import { LabwareAwaitingStorageInfo } from '../Store';

interface LabwareAwaitingStorageProps {
  /***
   * List of labwares
   */
  labwares: LabwareAwaitingStorageInfo[];
  /**
   *If enabled, the add and Store All button will be enabled
   */
  storeEnabled: boolean;
  /**
   * Callback to handle both store actions (one at a time or all labwares)
   * @param labwares - Labware(s) to store
   *
   */
  onStoreLabwares: (labwares: LabwareAwaitingStorageInfo[]) => void;
}

const LabwareAwaitingStorage: React.FC<LabwareAwaitingStorageProps> = ({
  labwares,
  storeEnabled = true,
  onStoreLabwares
}) => {
  return (
    <div className="mx-auto max-w-screen-xl">
      <Panel>
        <div className={'mt-2 mb-4 font-semibold'}>Awaiting storage</div>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Barcode</TableHeader>
              <TableHeader>Labware Type</TableHeader>
              <TableHeader>External Identifier</TableHeader>
              <TableHeader>Donor</TableHeader>
              <TableHeader>Tissue Type</TableHeader>
              <TableHeader>Spatial Location</TableHeader>
              <TableHeader>Replicate</TableHeader>
              <TableHeader />
            </tr>
          </TableHead>
          <TableBody>
            {labwares.map((labware) => (
              <tr key={labware.barcode}>
                <TableCell>{labware.barcode}</TableCell>
                <TableCell>{labware.labwareType}</TableCell>
                <TableCell>{labware.externalIdentifier}</TableCell>
                <TableCell>{labware.donor}</TableCell>
                <TableCell>{labware.tissueType}</TableCell>
                <TableCell>{labware.spatialLocation}</TableCell>
                <TableCell>{labware.replicate}</TableCell>
                <TableCell>
                  <IconButton
                    dataTestId={`addIcon-${labware.barcode}`}
                    disabled={!storeEnabled}
                    onClick={() => onStoreLabwares([labware])}
                  >
                    <AddIcon className={`inline-block h-5 w-4 ${storeEnabled ? 'text-red-600' : 'text-gray-600'}`} />
                  </IconButton>
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
        <div className=" mt-4 flex flex-row items-center justify-end">
          <BlueButton type="button" onClick={() => onStoreLabwares(labwares)} disabled={!storeEnabled}>
            Store All
          </BlueButton>
        </div>
      </Panel>
    </div>
  );
};

export default LabwareAwaitingStorage;
