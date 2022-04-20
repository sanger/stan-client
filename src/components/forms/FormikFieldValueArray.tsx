import { useEffect } from "react";
import { useFormikContext } from "formik";

type FormikFieldValueArrayProps = {
  /**
   * Name of the field to keep updated
   */
  field: string;

  /**
   * The value for the given field
   */
  values: string[];
};

/**
 * Component that will keep the named Formik field updated with the given value
 */
export function FormikFieldValueArray({
  field,
  values,
}: FormikFieldValueArrayProps) {
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    setFieldValue(field, values);
  }, [field, values, setFieldValue]);

  return null;
}
