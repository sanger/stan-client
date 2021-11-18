import SlideProcessing from "./SlideProcessing";
import React from "react";
import { QCType } from "../../pages/VisiumQC";
import { CommentFieldsFragment, LabwareFieldsFragment } from "../../types/sdk";
import { ClientError } from "graphql-request";

export type VisiumQCTypeProps = {
  /***
   * Work Number
   */
  workNumber: string | undefined;

  /***
   * Comments
   */
  comments: CommentFieldsFragment[];

  /***
   * Labware scanned
   */
  labware: LabwareFieldsFragment | undefined;

  /***
   * Handler for closing labware display panel
   * @param barcode Barcode of the labware removed
   */
  removeLabware: (barcode: string) => void;

  /**
   * Callback to indicate the success of saving result.
   */
  onSave: () => void;
  /**
   * Callback to indicate the failure/error in saving result.
   */
  onError: (error: ClientError) => void;
};

const VisiumQCType = ({
  qcType,
  qcTypeProps,
}: {
  qcType: string;
  qcTypeProps: VisiumQCTypeProps;
}) => {
  switch (qcType) {
    case QCType.SLIDE_PROCESSING: {
      return (
        <SlideProcessing
          workNumber={qcTypeProps.workNumber}
          comments={qcTypeProps.comments}
          labware={qcTypeProps.labware}
          removeLabware={qcTypeProps.removeLabware}
          onSave={qcTypeProps.onSave}
          onError={qcTypeProps.onError}
        />
      );
    }
  }
  return <></>;
};

export default VisiumQCType;
