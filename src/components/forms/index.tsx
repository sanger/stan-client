import React from "react";
import { getIn, useFormikContext } from "formik";

export const ErrorMessage = ({ name }: { name: string }) => {
  const { errors, touched } = useFormikContext();
  const error = getIn(errors, name);
  const touch = getIn(touched, name);
  return touch && error ? (
    <p className="text-red-500 text-xs italic">{error}</p>
  ) : null;
};

type OptionTemplate<
  L extends string,
  V extends string,
  LV = string | number,
  VV = string | number
> = {
  [key in L]: LV;
} &
  {
    [key in V]: VV;
  };

export function optionValues<
  L extends string,
  V extends string,
  T extends OptionTemplate<L, V>
>(entities: T[], label: L, value: V) {
  return entities.map((e, index) => {
    return (
      <option key={index} value={e[value]}>
        {e[label]}
      </option>
    );
  });
}
