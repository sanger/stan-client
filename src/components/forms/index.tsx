import React from 'react';
import { getIn, useFormikContext } from 'formik';
import { alphaNumericSortDefault, FCWithChildren } from '../../types/stan';

/**
 * Will display an error message if <code>name</code> has been touched and has an error
 * @param name a field's name in Formik state
 */
export const FormikErrorMessage = ({ name }: React.PropsWithChildren<{ name: string }>) => {
  const { errors, touched } = useFormikContext();
  const error = getIn(errors, name);
  const touch = getIn(touched, name);
  return touch && error ? <ErrorMessage>{error}</ErrorMessage> : null;
};

/**
 * Styled paragraph for an error message on a form input
 */
export const ErrorMessage: FCWithChildren = ({ children }) => {
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
 * Extends OptionTemplate to allow for additional properties.
 */
export type ExtendedOptionTemplate<
  L extends string,
  V extends string,
  LV = string | number,
  VV = string | number
> = OptionTemplate<L, V, LV, VV> & {
  [key: string]: any;
};

type SortProps = {
  sort: boolean;
  sortType?: 'Ascending' | 'Descending';
  alphaFirst?: boolean;
  excludeWords?: string[];
};

/**
 * Sorts a given array of entities based on specified sort properties and a label.
 *
 * @template L - A type representing the label's string keys.
 * @template V - A type representing the value's string keys.
 * @template T - A type representing the entities, which could be either OptionTemplate or ExtendedOptionTemplate.
 *
 * @param {T[]} entities - The list of entities to be sorted.
 * @param {L} label - The label key based on which the entities are to be sorted.
 * @param {SortProps} sortProps - An object containing sort properties:
 *   @prop {boolean} sort - Indicates whether to sort or not.
 *   @prop {('Ascending' | 'Descending')} [sortType='Ascending'] - The type of sort, defaults to 'Ascending'.
 *   @prop {boolean} [alphaFirst=false] - A flag indicating if alphanumeric sorting should prioritize alphabetical characters. Defaults to `false`.
 *   @prop {string[]} [excludeWords=['None']] - A list of words to be excluded from the sort operation.
 *
 * @returns {T[]} - A sorted list of entities. If no sorting is required, the original list is returned.
 *
 * @example
 * const data = [{username: 'Alice', age: 28}, {username: 'Bob', age: 22}];
 * const sortedData = sortEntities(data, 'username', { sort: true, sortType: 'Ascending' });
 */

function sortEntities<
  L extends string,
  V extends string,
  T extends OptionTemplate<L, V> | ExtendedOptionTemplate<L, V>
>(entities: T[], label: L, sortProps: SortProps) {
  if (!entities || entities.length === 0) return [];
  if (!sortProps.sort) return entities;

  return [...entities].sort((a, b) => {
    const sortType = sortProps.sortType ?? 'Ascending';
    const aVal = sortType === 'Ascending' ? a[label] : b[label];
    const bVal = sortType === 'Ascending' ? b[label] : a[label];
    if (sortProps.excludeWords?.includes(String(aVal)) || String(bVal) === 'None') return 0;
    return alphaNumericSortDefault(String(aVal).toUpperCase(), String(bVal).toUpperCase(), sortProps.alphaFirst);
  });
}

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
  sortProps: SortProps = {
    sort: true,
    sortType: 'Ascending',
    alphaFirst: false,
    excludeWords: ['None']
  }
) {
  if (!entities || entities.length === 0) return <option />;
  return sortEntities(entities, label, sortProps).map((e, index) => {
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
  sortProps: SortProps = {
    sort: true,
    sortType: 'Ascending',
    alphaFirst: false,
    excludeWords: ['None']
  }
) {
  return sortEntities(entities, label, sortProps).map((e) => {
    return { value: String(e[value]), label: e[label] };
  });
}

export function extendedSelectOptionValues<L extends string, V extends string, T extends ExtendedOptionTemplate<L, V>>(
  entities: T[],
  label: L,
  value: V,
  keyAsValue?: boolean,
  sortProps: SortProps = {
    sort: true,
    sortType: 'Ascending',
    alphaFirst: false,
    excludeWords: ['None']
  },
  extraProperty?: string
) {
  return sortEntities(entities, label, sortProps).map((e) => {
    return {
      value: String(e[value]),
      label: extraProperty && e[extraProperty] ? `${e[label]}  (${e[extraProperty]})` : e[label]
    };
  });
}

export function formikName(prefix: string, name: string): string {
  if (prefix === '') return name;
  return [prefix, name].join('.');
}

export const onPreventEnterKeyDefault = (e: React.KeyboardEvent<HTMLInputElement>) => {
  e.key === 'Enter' && e.preventDefault();
};
