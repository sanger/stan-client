import { Column } from "react-table";
import {
  ExtractResultQuery,
  LabwareFieldsFragment,
  SampleFieldsFragment,
} from "../../types/sdk";

/**
 * Type that can be used for displaying a Sample in a table row, along with its slot address
 */
type ExtractResultDataTableRow = LabwareFieldsFragment & {
  concentration: string;
};

/**
 * Defined type for a function that returns a column that displays some property of Labware
 */
type ColumnFactory<E = any> = (meta?: E) => Column<ExtractResultDataTableRow>;
