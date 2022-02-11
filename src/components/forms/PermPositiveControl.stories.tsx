import React from "react";

import { Meta } from "@storybook/react";

import PermPositiveControl from "./PermPositiveControl";
import { Form, Formik } from "formik";
import { RecordPermRequest } from "../../types/sdk";
import BlueButton from "../buttons/BlueButton";

export default {
  title: "Forms/Formik/PermPositiveControl",
  component: PermPositiveControl,
} as Meta;

export const Primary = () => {
  return (
    <Formik<RecordPermRequest>
      onSubmit={async (values) => alert(JSON.stringify(values))}
      initialValues={{
        barcode: "STAN-123",
        workNumber: "SGP-456",
        permData: [
          {
            address: "A1",
            controlBarcode: "STAN-123",
          },
        ],
      }}
    >
      <Form>
        <PermPositiveControl name={"permData[0]"} controlTube={undefined} />
        <BlueButton type={"submit"}>Submit</BlueButton>
      </Form>
    </Formik>
  );
};
