import React, { useEffect, useRef } from "react";
import AppShell from "../components/AppShell";
import Warning from "../components/notifications/Warning";
import RegistrationForm from "./registration/RegistrationForm";
import RegistrationSuccess from "./registration/RegistrationSuccess";
import RegistrationPresentationModel from "../lib/presentationModels/registrationPresentationModel";
import { Formik } from "formik";
import {
  FormValues,
  getInitialTissueValues,
} from "../lib/services/registrationService";
import columns from "../components/labwareScanPanel/columns";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "../components/Modal";
import WhiteButton from "../components/buttons/WhiteButton";
import PinkButton from "../components/buttons/PinkButton";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../components/Table";
import StyledLink from "../components/StyledLink";
import ExternalIcon from "../components/icons/ExternalIcon";

interface RegistrationParams {
  model: RegistrationPresentationModel;
}

const Registration: React.FC<RegistrationParams> = ({ model }) => {
  const warningRef = useRef<HTMLDivElement>(null);

  // Scroll the error notification into view if it appears
  useEffect(() => {
    warningRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  if (model.isComplete()) {
    return (
      <RegistrationSuccess
        labware={model.registrationResult.register.labware}
        columns={[
          columns.barcode(),
          columns.labwareType(),
          columns.externalName(),
        ]}
      />
    );
  }

  // Initial values provided to Formik
  const initialValues: FormValues = { tissues: [getInitialTissueValues()] };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Tissue Registration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {model.isSubmissionError() && (
            <div ref={warningRef}>
              <Warning message={"There was a problem registering your tissues"}>
                <ul className="list-disc list-inside">
                  {model.registrationErrors.problems.map((problem, index) => {
                    return <li key={index}>{problem}</li>;
                  })}
                </ul>
              </Warning>
            </div>
          )}

          {model.isReady() && (
            <Formik<FormValues>
              initialValues={initialValues}
              validationSchema={model.registrationSchema}
              validateOnChange={false}
              validateOnBlur={true}
              onSubmit={(values) => {
                model.submitForm(values);
              }}
            >
              {({ values }) => (
                <>
                  <RegistrationForm model={model} />

                  <Modal show={model.submissionHasClash()}>
                    <ModalHeader>External Name Already In Use</ModalHeader>
                    <ModalBody>
                      <div className="space-y-8">
                        <p>
                          Tissue with the following external identifiers already
                          exist in the given labware:
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
                            {model.registrationResult?.register.clashes.map(
                              (clash) => {
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
                              }
                            )}
                          </TableBody>
                        </Table>

                        <p>
                          Are you sure you want to continue? New labware will be
                          created for tissues with pre-existing external
                          identifiers.
                        </p>
                      </div>
                    </ModalBody>
                    <ModalFooter>
                      <PinkButton
                        type="button"
                        onClick={() => model.submitForm(values, true)}
                        className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Confirm
                      </PinkButton>
                      <WhiteButton
                        type="button"
                        onClick={model.editSubmission}
                        className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </WhiteButton>
                    </ModalFooter>
                  </Modal>
                </>
              )}
            </Formik>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Registration;
