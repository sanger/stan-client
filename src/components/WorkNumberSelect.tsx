import React, { useCallback, useEffect, useState } from "react";
import { optionValues } from "./forms";
import FormikSelect, { Select } from "./forms/Select";
import { Work, WorkStatus } from "../types/sdk";
import { stanCore } from "../lib/sdk";

type WorkSelectProps = {
  /**
   * Optional. If set, the name that will be used for the formik select
   */
  name?: string;

  /**
   * Optional. If set, the label will be used for select
   */
  label?: string;

  /**
   * Optional. If set, this value will be selected if that exist in work list
   */
  workNumber?: string;

  /**
   * Optional. Callback for when the work number changes in the select
   * @param workNumber the new work number (or undefined if none are selected)
   */
  onWorkNumberChange?: (workNumber: string | undefined) => void;
};

/**
 * Component for displaying a list of active work numbers
 */
export default function WorkNumberSelect({
  name,
  label,
  workNumber,
  onWorkNumberChange,
}: WorkSelectProps) {
  /**
   * State for holding active work
   */
  const [works, setWorks] = useState<Array<Pick<Work, "workNumber">>>([]);
  const [selectedWorkNumber, setSelectedWorkNumber] = useState<
    string | undefined
  >(undefined);
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

  useEffect(() => {
    if (!workNumber) setSelectedWorkNumber("");
    const work = works.find((work) => work.workNumber === workNumber);
    if (work) {
      setSelectedWorkNumber(workNumber);
    }
  }, [workNumber, works]);

  /**
   * Callback for when the select changes
   */
  const handleWorkNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedWorkNumber(e.currentTarget.value);
      onWorkNumberChange?.(e.target.value === "" ? undefined : e.target.value);
    },
    [onWorkNumberChange]
  );

  return name ? (
    <FormikSelect
      label={label ?? ""}
      name={name}
      emptyOption={true}
      onChange={handleWorkNumberChange}
    >
      {optionValues(works, "workNumber", "workNumber")}
    </FormikSelect>
  ) : (
    <Select
      value={selectedWorkNumber}
      onChange={handleWorkNumberChange}
      emptyOption={true}
    >
      {optionValues(works, "workNumber", "workNumber")}
    </Select>
  );
}
