import React from "react";
import AppShell from "../components/AppShell";
import { Formik } from "formik";
import ReleaseForm from "./release/ReleaseForm";
import ReleasePresentationModel from "../lib/presentationModels/releasePresentationModel";

interface PageParams {
  model: ReleasePresentationModel;
}

const Release: React.FC<PageParams> = ({ model }) => {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Release</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik
            initialValues={model.initialFormValues}
            validationSchema={model.formSchema}
            onSubmit={model.onSubmit}
          >
            {(formik) => <ReleaseForm model={model} formik={formik} />}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Release;
