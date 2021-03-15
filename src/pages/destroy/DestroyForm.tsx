import React, { useEffect } from "react";
import { Form, FormikProps } from "formik";
import { DestroyRequest, LabwareLayoutFragment } from "../../types/graphql";
import DestroyPresentationModel from "../../lib/presentationModels/destroyPresentationModel";
import Success from "../../components/notifications/Success";
import { toast } from "react-toastify";
import GrayBox, { Sidebar } from "../../components/layouts/GrayBox";
import { motion } from "framer-motion";
import variants from "../../lib/motionVariants";
import Warning from "../../components/notifications/Warning";
import Heading from "../../components/Heading";
import MutedText from "../../components/MutedText";
import LabwareScanPanel from "../../components/labwareScanPanel/LabwareScanPanel";
import columns from "../../components/labwareScanPanel/columns";
import { FormikErrorMessage } from "../../components/forms";
import FormikSelect from "../../components/forms/Select";
import PinkButton from "../../components/buttons/PinkButton";
import LabwareScanner from "../../components/labwareScanner/LabwareScanner";

interface DestroyFormProps {
  model: DestroyPresentationModel;
  formik: FormikProps<DestroyRequest>;
}

const DestroyForm: React.FC<DestroyFormProps> = ({ model, formik }) => {
  const { setFieldValue } = formik;

  // Update the formik barcodes field when labware changes in the scan panel
  const onScanPanelChange = React.useCallback(
    (labwares: LabwareLayoutFragment[]) => {
      setFieldValue(
        "barcodes",
        labwares.map((lw) => lw.barcode)
      );
    },
    [setFieldValue]
  );

  const isSubmitted = model.isDestroyed;
  useEffect(() => {
    if (isSubmitted) {
      const ToastSuccess = () => <Success message={"Labware(s) Destroyed"} />;

      toast(ToastSuccess, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }, [isSubmitted]);

  return (
    <Form>
      <GrayBox>
        <motion.div
          variants={variants.fadeInParent}
          initial={"hidden"}
          animate={"visible"}
          exit={"hidden"}
          className="md:w-2/3 space-y-10"
        >
          {model.showWarning && <Warning error={model.context.serverError} />}

          <motion.div variants={variants.fadeInWithLift} className="space-y-4">
            <Heading level={3}>Labware</Heading>
            <MutedText>
              Please scan in the labware you wish to destroy.
            </MutedText>

            <LabwareScanner
              onChange={onScanPanelChange}
              locked={model.formLocked}
            >
              <LabwareScanPanel
                columns={[
                  columns.barcode(),
                  columns.donorId(),
                  columns.labwareType(),
                  columns.externalName(),
                ]}
              />
            </LabwareScanner>
            <FormikErrorMessage name={"barcodes"} />
          </motion.div>

          <motion.div variants={variants.fadeInWithLift} className="space-y-4">
            <Heading level={3}>Reason</Heading>
            <MutedText>Please select the reason for destruction.</MutedText>

            <FormikSelect
              disabled={model.formLocked}
              label={"Reason"}
              name={"reasonId"}
              emptyOption
            >
              {model.context.destroyInfo.destructionReasons.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.text}
                </option>
              ))}
            </FormikSelect>
          </motion.div>
        </motion.div>

        <Sidebar>
          <Heading level={3} showBorder={false}>
            Summary
          </Heading>

          {formik.values.barcodes.length > 0 ? (
            <p>
              <span className="font-semibold">
                {formik.values.barcodes.length}
              </span>{" "}
              piece(s) of labware will be destroyed.
            </p>
          ) : (
            <p className="italic text-sm">No labwares scanned.</p>
          )}

          <PinkButton
            disabled={model.formLocked}
            type="submit"
            className="sm:w-full"
          >
            Destroy Labware
          </PinkButton>
        </Sidebar>
      </GrayBox>
    </Form>
  );
};

export default DestroyForm;
