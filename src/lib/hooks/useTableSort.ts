import React from "react";
import { getPropertyValue, SortDirection, StringKeyedProps } from "../helpers";
import { alphaNumericSortDefault } from "../../types/stan";

export type SortConfigProps = {
  /**
   * Field to sort
   **/
  primaryKey: string;

  /**
   * Sort direction - ascending or descending
   */
  direction: SortDirection;

  /**
   * Optional secondary key (
   * Useful in cases where you have multiple inner objects with same field.
   * For e.g workType and project objects need to be sorted with 'name' field
   * primaryKey as 'workType' or 'project' and secondaryKey as 'name'
   * */
  secondaryKey?: string;

  /**
   * custom sort functionality for the field
   * @param a
   * @param b
   */
  customSort?: (a: any, b: any, sortDirection?: SortDirection) => number;
};

/**
 * Hook for sorting table data.
 * Works with any <Table> component data
 * Sorts any array even using fields of contained objects in any depth, supports alphanumeric value sort as well
 */
export function useTableSort<T extends StringKeyedProps>(
  items: T[],
  config: SortConfigProps | null = null
) {
  /**
   * Sort configurationb state
   */
  const [sortConfig, setSortConfig] = React.useState(config);

  /**Memoised sorted Items**/
  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        /**Get value to sort based on primaryKey and secondaryKey**/
        let aVal = getPropertyValue(
          a,
          sortConfig.primaryKey,
          sortConfig.secondaryKey
        );
        let bVal = getPropertyValue(
          b,
          sortConfig.primaryKey,
          sortConfig.secondaryKey
        );

        /**If custom sort function is given, use that to sort values**/
        if (sortConfig.customSort) {
          return sortConfig.direction === "ascending"
            ? sortConfig.customSort(aVal, bVal)
            : sortConfig.customSort(bVal, aVal);
        } else {
          /**Use alphanumeric sort for string values*/
          if (typeof aVal === "string" && typeof bVal == "string") {
            return sortConfig.direction === "ascending"
              ? alphaNumericSortDefault(aVal.toLowerCase(), bVal.toLowerCase())
              : alphaNumericSortDefault(bVal.toLowerCase(), aVal.toLowerCase());
          } else {
            //Make sure empty strings will be at the bottom for both sorting
            aVal =
              aVal === ""
                ? sortConfig.direction === "ascending"
                  ? Number.MAX_VALUE
                  : Number.MIN_VALUE
                : aVal;
            bVal =
              bVal === ""
                ? sortConfig.direction === "ascending"
                  ? Number.MAX_VALUE
                  : Number.MIN_VALUE
                : bVal;
            if (aVal < bVal) {
              return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (aVal > bVal) {
              return sortConfig.direction === "ascending" ? 1 : -1;
            }
          }
          return 0;
        }
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  /**sort action call*/
  const sort = (
    key: string,
    subPropertyKey?: string,
    customSort?: (a: any, b: any) => number
  ) => {
    let direction: SortDirection = "ascending";
    if (
      sortConfig &&
      sortConfig.primaryKey === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({
      primaryKey: key,
      secondaryKey: subPropertyKey,
      direction,
      customSort,
    });
  };

  return { sortedTableData: sortedItems, sort, sortConfig };
}
