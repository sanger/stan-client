import React from "react";

import { Meta } from "@storybook/react";

import PermDataField from "./PermDataField";
import { Form, Formik } from "formik";
import { RecordPermRequest } from "../../types/sdk";
import BlueButton from "../buttons/BlueButton";

export default {
  title: "Forms/Formik/PermDataField",
  component: PermDataField,
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
            seconds: 1,
          },
        ],
      }}
    >
      <Form>
        <PermDataField name={"permData[0]"} />
        <BlueButton type={"submit"}>Submit</BlueButton>
      </Form>
    </Formik>
  );
};
