import { LabwareFieldsFragment } from "../../types/sdk";
import React from "react";
import { FieldArray } from "formik";
import LabwareScanner from "./LabwareScanner";

type FormikLabwareScannerProps<T> = {
  /**
   * Optional: The initial labware to display in the form
   */
  initialLabware?: Array<LabwareFieldsFragment>;

  /**
   * Optional: The name of the Formik field
   * @default labware
   */
  name?: string;

  /**
   * Callback for building the initial labware form value
   * @param labware
   */
  buildLabware: (labware: LabwareFieldsFragment) => T;

  /**
   * React children that will have access to {@link LabwareScanner} context
   */
  children: React.ReactNode;
};

/**
 * Component for managing a list of labware within a Formik form. Integrates with Formik's {@code FieldArray}.
 *
 * @example
 * <FormikLabwareScanner<ExtractResultLabware>
     initialLabware={initialLabware}
     buildLabware={buildExtractResultLabware}
   >
     <ExtractResultLabwareTable availableComments={info.comments} />
   </FormikLabwareScanner>
 */
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
