import React from "react";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "../../components/Modal";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../../components/Table";
import StyledLink from "../../components/StyledLink";
import ExternalIcon from "../../components/icons/ExternalIcon";
import PinkButton from "../../components/buttons/PinkButton";
import WhiteButton from "../../components/buttons/WhiteButton";
import { RegisterTissuesMutation } from "../../types/sdk";

type ClashModalProps = {
  registrationResult: RegisterTissuesMutation;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ClashModal({
  registrationResult,
  onConfirm,
  onCancel,
}: ClashModalProps) {
  return (
    <Modal show={true}>
      <ModalHeader>External Name Already In Use</ModalHeader>
      <ModalBody>
        <div className="space-y-8">
          <p>
            Tissue with the following external identifiers already exist in the
            given labware:
          </p>

          <Table>
            <TableHead>
              <tr>
                <TableHeader>External ID</TableHeader>
                <TableHeader>Labware Barcode</TableHeader>
                <TableHeader>Labware Type</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {registrationResult.register.clashes.map((clash) => {
                return clash.labware.map((lw, index) => (
                  <tr key={lw.barcode}>
                    {index === 0 && (
                      <TableCell rowSpan={clash.labware.length}>
                        {clash.tissue.externalName}
                      </TableCell>
                    )}
                    <TableCell>
                      <StyledLink
                        target="_blank"
                        to={`/store?labwareBarcode=${lw.barcode}`}
                      >
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
            Are you sure you want to continue? New labware will be created for
            tissues with pre-existing external identifiers.
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <PinkButton
          type="button"
          onClick={onConfirm}
          className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
        >
          Confirm
        </PinkButton>
        <WhiteButton
          type="button"
          onClick={onCancel}
          className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancel
        </WhiteButton>
      </ModalFooter>
    </Modal>
  );
}
