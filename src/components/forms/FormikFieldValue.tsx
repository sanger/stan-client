import { useEffect } from "react";
import { useFormikContext } from "formik";

type FormikFieldValueProps = {
  /**
   * Name of the field to keep updated
   */
  field: string;

  /**
   * The value for the given field
   */
  value: string;
};

/**
 * Component that will keep the named Formik field updated with the given value
 */
export function FormikFieldValue({ field, value }: FormikFieldValueProps) {
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    setFieldValue(field, value);
  }, [field, value, setFieldValue]);

  return null;
}
