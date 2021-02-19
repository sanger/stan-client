import React from "react";
import AppShell from "../components/AppShell";
import DestroyPresentationModel from "../lib/presentationModels/destroyPresentationModel";
import ReleaseForm from "./release/ReleaseForm";
import { Formik } from "formik";
import DestroyForm from "./destroy/DestroyForm";

interface PageParams {
  model: DestroyPresentationModel;
}

const Destroy: React.FC<PageParams> = ({ model }) => {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Destroy Labware</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <Formik
            initialValues={model.initialFormValues}
            validationSchema={model.formSchema}
            onSubmit={model.onSubmit}
          >
            {(formik) => <DestroyForm model={model} formik={formik} />}
          </Formik>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Destroy;
