import React from "react";
import { getContainedObjectWithField, StringKeyedProps } from "../helpers";
import { defaultAplhaNumericSort } from "../../types/stan";

type Direction = "ascending" | "descending";
export type SortConfigProps = {
  primaryKey: string;
  memberPropertyKey?: string;
  direction: Direction;
  customSort?: (a: any, b: any) => number;
};

/**
 * Hook for sorting table data.
 * Works with any Table component data
 *
 */
export function useTableSort<T extends StringKeyedProps>(
  items: T[],
  config: SortConfigProps | null = null
) {
  const [sortConfig, setSortConfig] = React.useState(config);

  const getSortFieldStringKey = React.useCallback(
    (
      object: Object,
      primaryKey: string,
      memberPropertyKey?: string
    ): string => {
      const sortObject:
        | StringKeyedProps
        | undefined = getContainedObjectWithField(primaryKey, object);
      if (!sortObject) return "";
      const sortField = sortObject[primaryKey];

      if (typeof sortField !== "object") {
        return String(sortField);
      }
      //The key property given is an object, so check if any memberPropertyKey key given which is a string type
      const sortFieldObject: StringKeyedProps = sortField;
      if (
        memberPropertyKey &&
        sortFieldObject &&
        typeof sortFieldObject[memberPropertyKey] === "string"
      ) {
        return sortFieldObject[memberPropertyKey];
      }
      //No memberPropertyKey given, so try to find a member property which is not an object type
      else {
        for (let property in sortField) {
          if (
            sortFieldObject.hasOwnProperty(property) &&
            typeof sortFieldObject[property] === "string" &&
            property !== "__typename"
          ) {
            return sortFieldObject[property];
          }
        }
      }
      return "";
    },
    []
  );
  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = getSortFieldStringKey(
          a,
          sortConfig.primaryKey,
          sortConfig.memberPropertyKey
        ).toLowerCase();
        const bVal = getSortFieldStringKey(
          b,
          sortConfig.primaryKey,
          sortConfig.memberPropertyKey
        ).toLowerCase();
        if (sortConfig.customSort) {
          return sortConfig.direction === "ascending"
            ? sortConfig.customSort(aVal, bVal)
            : sortConfig.customSort(bVal, aVal);
        } else {
          return sortConfig.direction === "ascending"
            ? defaultAplhaNumericSort(aVal, bVal)
            : defaultAplhaNumericSort(bVal, aVal);
          /*const regExp = /^[a-z0-9]+$/i;
          debugger;
          if (regExp.test(aVal) || regExp.test(bVal)) {
            return defaultAplhaNumericSort(aVal, bVal);
          } else {
            if (aVal < bVal) {
              return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (aVal > bVal) {
              return sortConfig.direction === "ascending" ? 1 : -1;
            }
          }*/
        }
      });
    }
    return sortableItems;
  }, [items, sortConfig, getSortFieldStringKey]);

  const requestSort = (
    key: string,
    subPropertyKey?: string,
    customSort?: (a: any, b: any) => number
  ) => {
    let direction: Direction = "ascending";
    if (
      sortConfig &&
      sortConfig.primaryKey === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({
      primaryKey: key,
      memberPropertyKey: subPropertyKey,
      direction,
      customSort,
    });
  };

  return { items: sortedItems, requestSort, sortConfig };
}
