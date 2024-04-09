import React from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '../../components/Modal';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../../components/Table';
import StyledLink from '../../components/StyledLink';
import ExternalIcon from '../../components/icons/ExternalIcon';
import { RegisterResultFieldsFragment } from '../../types/sdk';
import { Link } from 'react-router-dom';
import BlueButton from '../../components/buttons/BlueButton';
import MutedText from '../../components/MutedText';

type ClashModalProps = {
  registrationResult: RegisterResultFieldsFragment;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ClashModal({ registrationResult, onConfirm, onCancel }: ClashModalProps) {
  const linkToUnrelease: string = registrationResult.clashes
    .map((clash) => {
      return clash.labware.map((lw) => `barcode=${lw.barcode}`).join('&');
    })
    .join('&');

  return (
    <Modal show={true}>
      <ModalHeader>External Name Already In Use</ModalHeader>
      <ModalBody>
        <div className="space-y-8">
          <p>Tissue with the following external identifiers already exist in the given labware:</p>

          <Table>
            <TableHead>
              <tr>
                <TableHeader>External ID</TableHeader>
                <TableHeader>Labware Barcode</TableHeader>
                <TableHeader>Labware Type</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {registrationResult.clashes.map((clash) => {
                return clash.labware.map((lw, index) => (
                  <tr key={lw.barcode}>
                    {index === 0 && <TableCell rowSpan={clash.labware.length}>{clash.tissue.externalName}</TableCell>}
                    <TableCell>
                      <StyledLink target="_blank" to={`/store?labwareBarcode=${lw.barcode}`}>
                        {lw.barcode}
                      </StyledLink>
                      <ExternalIcon className="inline-block mb-1 ml-1 h-4 w-4" />
                    </TableCell>
                    <TableCell>{lw.labwareType.name}</TableCell>
                  </tr>
                ));
              })}
            </TableBody>
          </Table>

          <p>
            Are you sure you want to continue? New labware will be created for tissues with pre-existing external
            identifiers.
          </p>
          <MutedText>Click on Unrelease, to navigate to the Unrelease page</MutedText>
        </div>
      </ModalBody>
      <ModalFooter>
        <BlueButton onClick={onConfirm} className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm">
          Confirm
        </BlueButton>
        <Link to={`/admin/unrelease?${linkToUnrelease}`} className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
          <BlueButton action="tertiary">Unrelease</BlueButton>
        </Link>
        <BlueButton action="secondary" onClick={onCancel} className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
          Cancel
        </BlueButton>
      </ModalFooter>
    </Modal>
  );
}
