import React from 'react';
import { getIn, useFormikContext } from 'formik';
import { alphaNumericSortDefault } from '../../types/stan';

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
  return <p className="flex-wrap text-red-500 text-xs italic">{children}</p>;
};

/**
 * Type used in optionValues.
 * Means both the property <code>L</code> and <code>V</code> must be strings,
 * and must return a string or number when used as a key.
 */
export type OptionTemplate<L extends string, V extends string, LV = string | number, VV = string | number> = {
  [key in L]: LV;
} & {
  [key in V]: VV;
};

/**
 * Utility for generating a list of <code><option></code> tags
 * @param entities list of models to generate options for
 * @param label name of the property on each entity to use for the label
 * @param value name of the property on each entity to use for the value
 * @param keyAsValue if enables value field will be used as keys
 * @param sortProps sorting props required for options displayed
 *        sort: Is sorting required? Default value is true
 *        sortType:'Ascending' or 'Descending' order. Default value is 'Ascending'
 *        alphaFirst: In alphanumeric strings, need to sort alpha part first or numeric part. Default value will sort numeric part first
 *        excludeWords: Any words need to be excluded from sorting, default will have "None"
 */
export function optionValues<L extends string, V extends string, T extends OptionTemplate<L, V>>(
  entities: T[],
  label: L,
  value: V,
  keyAsValue?: boolean,
  sortProps: { sort: boolean; sortType?: 'Ascending' | 'Descending'; alphaFirst?: boolean; excludeWords?: string[] } = {
    sort: true,
    sortType: 'Ascending',
    alphaFirst: false,
    excludeWords: ['None']
  }
) {
  if (!entities || entities.length === 0) return <option />;
  let mapEntities = sortProps.sort
    ? [...entities].sort((a, b) => {
        const sortType = sortProps.sortType ?? 'Ascending';
        const aVal = sortType === 'Ascending' ? a[label] : b[label];
        const bVal = sortType === 'Ascending' ? b[label] : a[label];
        if (sortProps.excludeWords?.includes(String(aVal)) || String(bVal) === 'None') return 0;
        return alphaNumericSortDefault(String(aVal).toUpperCase(), String(bVal).toUpperCase(), sortProps.alphaFirst);
      })
    : entities;
  return mapEntities.map((e, index) => {
    return (
      <option key={keyAsValue ? e[value] : index} value={e[value]}>
        {e[label]}
      </option>
    );
  });
}

export function selectOptionValues<L extends string, V extends string, T extends OptionTemplate<L, V>>(
  entities: T[],
  label: L,
  value: V,
  keyAsValue?: boolean,
  sortProps: { sort: boolean; sortType?: 'Ascending' | 'Descending'; alphaFirst?: boolean; excludeWords?: string[] } = {
    sort: true,
    sortType: 'Ascending',
    alphaFirst: false,
    excludeWords: ['None']
  }
) {
  if (!entities || entities.length === 0) return [];
  let mapEntities = sortProps.sort
    ? [...entities].sort((a, b) => {
        const sortType = sortProps.sortType ?? 'Ascending';
        const aVal = sortType === 'Ascending' ? a[label] : b[label];
        const bVal = sortType === 'Ascending' ? b[label] : a[label];
        if (sortProps.excludeWords?.includes(String(aVal)) || String(bVal) === 'None') return 0;
        return alphaNumericSortDefault(String(aVal).toUpperCase(), String(bVal).toUpperCase(), sortProps.alphaFirst);
      })
    : entities;
  return mapEntities.map((e) => {
    return { value: String(e[value]), label: e[label] };
  });
}

export function formikName(prefix: string, name: string): string {
  if (prefix === '') return name;
  return [prefix, name].join('.');
}
