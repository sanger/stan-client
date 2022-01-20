import React from "react";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../../components/Table";
import IconButton from "../../components/buttons/IconButton";
import AddIcon from "../../components/icons/AddIcon";
import BlueButton from "../../components/buttons/BlueButton";
import Panel from "../../components/Panel";
import { LabwareAwaitingStorageInfo } from "../Store";

interface LabwareAwaitingStorageProps {
  labwares: LabwareAwaitingStorageInfo[];
  addEnabled: boolean;
  onAddLabware: (labware: LabwareAwaitingStorageInfo) => void;
  onAddAllLabware: (labwares: LabwareAwaitingStorageInfo[]) => void;
}

const LabwareAwaitingStorage: React.FC<LabwareAwaitingStorageProps> = ({
  labwares,
  addEnabled = true,
  onAddAllLabware,
  onAddLabware,
}) => {
  return (
    <div className="mx-auto max-w-screen-xl">
      <Panel>
        <div className={"mt-2 mb-4 font-semibold"}>Awaiting storage</div>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Barcode</TableHeader>
              <TableHeader>Labware Type</TableHeader>
              <TableHeader />
            </tr>
          </TableHead>
          <TableBody>
            {labwares.map((labware) => (
              <tr key={labware.barcode}>
                <TableCell>{labware.barcode}</TableCell>
                <TableCell>{labware.labwareType}</TableCell>
                <TableCell>
                  <IconButton
                    data-testid="addIcon"
                    disabled={!addEnabled}
                    onClick={
                      onAddLabware ? () => onAddLabware(labware) : () => {}
                    }
                  >
                    <AddIcon
                      className={`inline-block h-5 w-4 ${
                        addEnabled ? "text-red-600" : "text-gray-600"
                      }`}
                    />
                  </IconButton>
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
        <div className=" mt-4 flex flex-row items-center justify-end">
          <BlueButton
            type="button"
            onClick={() => onAddAllLabware(labwares)}
            disabled={!addEnabled}
          >
            Store All
          </BlueButton>
        </div>
      </Panel>
    </div>
  );
};

export default LabwareAwaitingStorage;
