import { LabwareFieldsFragment } from '../../types/sdk';
import React from 'react';
import { FieldArray } from 'formik';
import LabwareScanner, { LabwareScannerProps } from './LabwareScanner';

type FormikLabwareScannerProps<T> = Omit<LabwareScannerProps, 'children' | 'onAdd' | 'onRemove'> & {
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
  name = 'labware',
  buildLabware,
  children,
  ...props
}: FormikLabwareScannerProps<T>) {
  return (
    <FieldArray name={name}>
      {({ push, remove }) => (
        <LabwareScanner
          onAdd={(labware) => push(buildLabware(labware))}
          onRemove={(_, index) => remove(index)}
          {...props}
        >
          {children}
        </LabwareScanner>
      )}
    </FieldArray>
  );
}
