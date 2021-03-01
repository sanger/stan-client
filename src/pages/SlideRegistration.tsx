import React, { useEffect, useRef } from "react";
import AppShell from "../components/AppShell";
import SlideRegistrationPresentationModel from "../lib/presentationModels/slideRegistrationPresentationModel";
import { Formik } from "formik";
import SlideRegistrationForm from "./registration/SlideRegistrationForm";
import { LabwareTypeName } from "../types/stan";
import columns from "../components/labwareScanPanel/columns";
import RegistrationSuccess from "./registration/RegistrationSuccess";
import Warning from "../components/notifications/Warning";

interface PageParams {
  model: SlideRegistrationPresentationModel;
}

const SlideRegistration: React.FC<PageParams> = ({ model }) => {
  const warningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    warningRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  if (model.showSummary) {
    return (
      <RegistrationSuccess
        labware={model.context.registrationResult.registerSections.labware}
        columns={[columns.barcode(), columns.labwareType()]}
      />
    );
  }

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Slide Registration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {model.showInitialLabwareTypes && (
            <div className="my-4 mx-4 max-w-screen-sm sm:mx-auto p-4 rounded-md bg-gray-100">
              <p className="my-3 text-gray-800 text-sm leading-normal">
                Pick a type of slide to begin:
              </p>

              <div className="flex flex-row items-center justify-center gap-4">
                <select
                  onChange={(e) =>
                    model.selectInitialLabwareType(
                      e.target.value as LabwareTypeName
                    )
                  }
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sdb-100 focus:border-sdb-100 md:w-1/2"
                >
                  <option value="" />
                  {model.availableSlides.map((labwareTypeName) => (
                    <option key={labwareTypeName} value={labwareTypeName}>
                      {labwareTypeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {model.showSubmissionErrors && (
            <div className="my-4" ref={warningRef}>
              <Warning
                error={model.context.registrationErrors}
                message={"There was a problem registering your slides"}
              />
            </div>
          )}

          {model.showForm && (
            <Formik
              initialValues={model.initialFormValues}
              validationSchema={model.validationSchema}
              validateOnChange={false}
              validateOnBlur={true}
              onSubmit={model.onSubmit}
            >
              <SlideRegistrationForm model={model} />
            </Formik>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default SlideRegistration;
