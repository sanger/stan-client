import React, { useCallback, useEffect, useState } from "react";
import { optionValues } from "./forms";
import FormikSelect, { Select } from "./forms/Select";
import { Work, WorkStatus } from "../types/sdk";
import { stanCore } from "../lib/sdk";

type WorkSelectProps = {
  /**
   * The name that will be used for the formik select
   * @default work_number
   */
  name?: string;

  /**
   * Callback for when the work number changes in the select
   * @param workNumber the new work number (or undefined if none are selected)
   */
  onWorkNumberChange?: (workNumber: string | undefined) => void;
};

/**
 * Component for displaying a list of active work numbers
 */
export default function WorkNumberSelect({
  name,
  onWorkNumberChange,
}: WorkSelectProps) {
  /**
   * State for holding active work
   */
  const [works, setWorks] = useState<Array<Pick<Work, "workNumber">>>([]);

  /**
   * Fetch active work and set them to state
   */
  useEffect(() => {
    async function fetchActiveWorkNumbers() {
      const response = await stanCore.FindWorkNumbers({
        status: WorkStatus.Active,
      });
      setWorks(response.works);
    }
    fetchActiveWorkNumbers();
  }, [setWorks]);

  /**
   * Callback for when the select changes
   */
  const handleWorkNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onWorkNumberChange?.(e.target.value === "" ? undefined : e.target.value);
    },
    [onWorkNumberChange]
  );

  const SelectElement = name ? FormikSelect : Select;

  return (
    <SelectElement
      label={""}
      name={name ?? ""}
      onChange={handleWorkNumberChange}
      emptyOption={true}
    >
      {optionValues(works, "workNumber", "workNumber")}
    </SelectElement>
  );
}
