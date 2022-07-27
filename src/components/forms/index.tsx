import React from "react";
import { getIn, useFormikContext } from "formik";

/**
 * Will display an error message if <code>name</code> has been touched and has an error
 * @param name a field's name in Formik state
 */
export const FormikErrorMessage = ({ name }: { name: string }) => {
  const { errors, touched } = useFormikContext();
  const error = getIn(errors, name);
  const touch = getIn(touched, name);
  return touch && error ? <ErrorMessage>{error}</ErrorMessage> : null;
};

/**
 * Styled paragraph for an error message on a form input
 */
export const ErrorMessage: React.FC = ({ children }) => {
  return <p className="text-red-500 text-xs italic">{children}</p>;
};

/**
 * Type used in optionValues.
 * Means both the property <code>L</code> and <code>V</code> must be strings,
 * and must return a string or number when used as a key.
 */
type OptionTemplate<
  L extends string,
  V extends string,
  LV = string | number,
  VV = string | number
> = {
  [key in L]: LV;
} & {
  [key in V]: VV;
};

/**
 * Utility for generating a list of <code><option></code> tags
 * @param entities list of models to generate options for
 * @param label name of the property on each entity to use for the label
 * @param value name of the property on each entity to use for the value
 */
export function optionValues<
  L extends string,
  V extends string,
  T extends OptionTemplate<L, V>
>(entities: T[], label: L, value: V) {
  if (!entities || entities.length === 0) return <option />;
  return entities.map((e, index) => {
    return (
      <option key={index} value={e[value]}>
        {e[label]}
      </option>
    );
  });
}

export function formikName(prefix: string, name: string): string {
  if (prefix === "") return name;
  return [prefix, name].join(".");
}
