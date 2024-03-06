import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import { ConfirmationModal } from '../modal/ConfirmationModal';
import React from 'react';
import { LabwareFlaggedFieldsFragment } from '../../types/sdk';
import { useNavigate } from 'react-router-dom';

type LabwareWithoutPermProps = {
  show: boolean;
  onSave: () => void;
  labwaresWithoutPerm: LabwareFlaggedFieldsFragment[];
  setWarnBeforeSave: React.Dispatch<React.SetStateAction<boolean>>;
};

export const LabwareWithoutPermConfirmationModal = ({
  show,
  onSave,
  setWarnBeforeSave,
  labwaresWithoutPerm
}: LabwareWithoutPermProps) => {
  const navigate = useNavigate();
  return (
    <ConfirmationModal
      show={show}
      header={'Save transferred slots'}
      message={{
        type: 'Warning',
        text: 'Labware without Permeabilisation'
      }}
      confirmOptions={[
        {
          label: 'Cancel',
          action: () => {
            setWarnBeforeSave(false);
          }
        },
        { label: 'Continue', action: onSave },
        {
          label: 'Visium permeabilisation',
          action: () => {
            navigate('/lab/visium_perm');
            setWarnBeforeSave(false);
          }
        }
      ]}
    >
      <p className={'font-bold mt-8'}>{'Permeabilisation has not been recorded on the following labware'}</p>
      <Table className={'mt-6 w-full overflow-y-visible'}>
        <TableHead>
          <tr>
            <TableHeader>Barcode</TableHeader>
            <TableHeader>Type</TableHeader>
          </tr>
        </TableHead>
        <TableBody>
          {labwaresWithoutPerm.map((lw) => (
            <tr key={lw.barcode}>
              <TableCell>{lw.barcode}</TableCell>
              <TableCell>{lw.labwareType.name}</TableCell>
            </tr>
          ))}
        </TableBody>
      </Table>
      <p className="mt-8 my-3 text-gray-800 text-center text-sm  leading-normal">
        If you wish to cancel this operation and record permeabilisation on these slides, click the
        <span className="font-bold text-gray-900"> Visium Permeabilisation </span>
        button.
      </p>{' '}
      <p className="my-3 text-gray-800 text-center text-sm  leading-normal">
        Otherwise click <span className="font-bold text-gray-900">Continue or Cancel</span> to record or cancel this
        operation.
      </p>
    </ConfirmationModal>
  );
};
