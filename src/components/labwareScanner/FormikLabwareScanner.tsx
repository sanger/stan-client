import { LabwareFieldsFragment } from "../../types/sdk";
import React from "react";
import { FieldArray } from "formik";
import LabwareScanner from "./LabwareScanner";

type FormikLabwareScannerProps<T> = {
  initialLabware?: Array<LabwareFieldsFragment>;
  name?: string;
  buildLabware: (labware: LabwareFieldsFragment) => T;
  children: React.ReactNode;
};

export function FormikLabwareScanner<T>({
  initialLabware = [],
  name = "labware",
  buildLabware,
  children,
}: FormikLabwareScannerProps<T>) {
  return (
    <FieldArray name={name}>
      {({ push, remove }) => (
        <LabwareScanner
          initialLabwares={initialLabware}
          onAdd={(labware) => push(buildLabware(labware))}
          onRemove={(_, index) => remove(index)}
        >
          {children}
        </LabwareScanner>
      )}
    </FieldArray>
  );
}
