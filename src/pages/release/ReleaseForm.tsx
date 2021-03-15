import React, { useEffect } from "react";
import GrayBox, { Sidebar } from "../../components/layouts/GrayBox";
import { motion } from "framer-motion";
import variants from "../../lib/motionVariants";
import Heading from "../../components/Heading";
import MutedText from "../../components/MutedText";
import LabwareScanPanel from "../../components/labwareScanPanel/LabwareScanPanel";
import columns from "../../components/labwareScanPanel/columns";
import FormikSelect from "../../components/forms/Select";
import PinkButton from "../../components/buttons/PinkButton";
import { Form, FormikProps } from "formik";
import { LabwareLayoutFragment, ReleaseRequest } from "../../types/graphql";
import { FormikErrorMessage } from "../../components/forms";
import ReleasePresentationModel from "../../lib/presentationModels/releasePresentationModel";
import Warning from "../../components/notifications/Warning";
import { toast } from "react-toastify";
import Success from "../../components/notifications/Success";
import WhiteButton from "../../components/buttons/WhiteButton";
import DownloadIcon from "../../components/icons/DownloadIcon";
import LabwareScanner from "../../components/labwareScanner/LabwareScanner";

interface ReleaseFormProps {
  model: ReleasePresentationModel;
  formik: FormikProps<ReleaseRequest>;
}

const ReleaseForm: React.FC<ReleaseFormProps> = ({ model, formik }) => {
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

  // Show a toast notification with a success message when sectioning is complete
  const isSubmitted = model.isSubmitted;
  useEffect(() => {
    if (isSubmitted) {
      const ToastSuccess = () => <Success message={"Labware(s) Released"} />;

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
              Please scan in the labware you wish to release.
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
            <Heading level={3}>Destination</Heading>

            <FormikSelect
              disabled={model.formLocked}
              label={"Group/Team"}
              name={"destination"}
              emptyOption
            >
              {model.context.destinations.map((destination) => (
                <option key={destination} value={destination}>
                  {destination}
                </option>
              ))}
            </FormikSelect>

            <FormikSelect
              disabled={model.formLocked}
              label={"Contact"}
              name={"recipient"}
              emptyOption
            >
              {model.context.recipients.map((recipient) => (
                <option key={recipient} value={recipient}>
                  {recipient}
                </option>
              ))}
            </FormikSelect>
          </motion.div>
        </motion.div>

        <Sidebar>
          <Heading level={3} showBorder={false}>
            Summary
          </Heading>

          {formik.values.barcodes.length > 0 && formik.values.destination ? (
            <p>
              <span className="font-semibold">
                {formik.values.barcodes.length}
              </span>{" "}
              piece(s) of labware will be released to{" "}
              <span className="font-semibold">{formik.values.destination}</span>
              .
            </p>
          ) : (
            <p className="italic text-sm">
              Please scan labwares and select a group/team.
            </p>
          )}

          {formik.values.recipient ? (
            <p>
              The primary contact is{" "}
              <span className="font-semibold">{formik.values.recipient}</span>.
            </p>
          ) : (
            <p className="italic text-sm">Please select a contact.</p>
          )}

          <PinkButton
            disabled={model.formLocked}
            loading={model.isSubmitting}
            type="submit"
            className="sm:w-full"
          >
            Release Labware
          </PinkButton>

          {model.isSubmitted && (
            <WhiteButton className="sm:w-full">
              <a
                className="w-full text-gray-800 focus:outline-none"
                download={"release.tsv"}
                href={model.releaseFilePath}
              >
                <DownloadIcon
                  className={"inline-block h-5 w-5 -mt-1 -ml-1 mr-2"}
                />
                Download Release File
              </a>
            </WhiteButton>
          )}
        </Sidebar>
      </GrayBox>
    </Form>
  );
};

export default ReleaseForm;
