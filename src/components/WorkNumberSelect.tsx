import React, { useCallback, useEffect, useState } from 'react';
import { optionValues } from './forms';
import FormikSelect, { Select } from './forms/Select';
import { WorkStatus } from '../types/sdk';
import { stanCore } from '../lib/sdk';
import Pill from './Pill';
import { alphaNumericSortDefault } from '../types/stan';
import { MultiSelect } from './multiSelect/MultiSelect';

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
  workNumber?: string | string[];

  /**
   * Optional. Callback for when the work number changes in the select
   * @param workNumber the new work number (or undefined if none are selected)
   */
  onWorkNumberChange?: (workNumber: string) => void;

  /**
   * Optional. Callback for the work number changes in the select  when there are multiple selections possible
   * @param workNumber the new work number (or undefined if none are selected)
   */
  onWorkNumberChangeInMulti?: (workNumber: string[]) => void;

  /**Criteria to filter orknumbers based on status. If not given, default will be 'Active'.
   * 'ALL' value will display all work numbers (with all statuses)**/
  workNumberType?: WorkStatus | 'ALL';

  /**Multiple valu selection allowed*/
  multiple?: boolean;

  /**Empty option required?*/
  emptyOption?: boolean;
};

export type WorkInfo = {
  workNumber: string;
  workRequester: string;
  project: string;
  status: WorkStatus;
};

/**
 * Component for displaying a list of active or all work numbers
 */
export default function WorkNumberSelect({
  name,
  label,
  workNumber,
  onWorkNumberChange,
  onWorkNumberChangeInMulti,
  workNumberType,
  multiple = false,
  emptyOption = true
}: WorkSelectProps) {
  /**
   * State for holding all  work
   */
  const [allWorks, setAllWorks] = useState<Array<WorkInfo>>([]);
  /**
   * State for holding work based on the list criteria -'workNumberType'
   */
  const [works, setWorks] = useState<Array<WorkInfo>>([]);

  const [selectedWork, setSelectedWork] = useState<WorkInfo | WorkInfo[] | undefined>(
    workNumber ? works.find((work) => work.workNumber === workNumber) : undefined
  );
  /**
   * State for validating select field
   */
  const [error, setError] = useState<string>('');
  /**
   * Fetch all works and set them to state
   */
  useEffect(() => {
    async function fetchAllWorkNumbers() {
      const response = await stanCore.GetAllWorkInfo();
      const works = response.works
        .map((workInfo) => {
          return {
            workNumber: workInfo.workNumber,
            workRequester: workInfo.workRequester ? workInfo.workRequester.username : '',
            project: workInfo.project.name,
            status: workInfo.status
          };
        })
        .sort((work1, work2) => {
          return alphaNumericSortDefault(work1.workNumber, work2.workNumber);
        })
        .reverse();
      setAllWorks(works);
    }
    fetchAllWorkNumbers();
  }, []);

  /**
   * Fetch  works based on workNumberType criteria
   */
  useEffect(() => {
    if (workNumberType && workNumberType === 'ALL') {
      setWorks(allWorks);
    } else {
      const status = workNumberType ?? WorkStatus.Active;
      setWorks(allWorks.filter((work) => work.status === status));
    }
    return () => {
      setWorks([]);
    };
  }, [setWorks, workNumberType, allWorks]);

  useEffect(() => {
    if (!workNumber) setSelectedWork(undefined);
    if (multiple) {
    } else {
      const work = works.find((work) => work.workNumber === workNumber);
      if (work) {
        setSelectedWork(work);
      }
    }
  }, [workNumber, works, setSelectedWork]);

  /**
   * Callback for when the select changes
   */
  const handleWorkNumberChange = useCallback(
    (selectedWorkNumbers: string[]) => {
      if (multiple) {
        setSelectedWork(
          works.filter((work) => selectedWorkNumbers.some((workNumber) => workNumber === work.workNumber))
        );
        onWorkNumberChangeInMulti?.(selectedWorkNumbers);
      } else {
        if (selectedWorkNumbers.length < 0) return;
        setSelectedWork(works.find((work) => work.workNumber === selectedWorkNumbers[0]));
        onWorkNumberChange?.(selectedWorkNumbers[0]);
      }
    },
    [onWorkNumberChange, setSelectedWork, works, onWorkNumberChangeInMulti]
  );

  const validateWorkNumber = () => {
    if (!selectedWork) {
      setError('SGP number is required');
    } else {
      setError('');
    }
  };

  return name ? (
    <div className={'flex flex-col'}>
      <FormikSelect
        label={label ?? ''}
        name={name}
        emptyOption={emptyOption}
        onBlur={validateWorkNumber}
        onChange={handleWorkNumberChange}
        className={'flex-grow w-full'}
        data-testid={'workNumber'}
      >
        {optionValues(works, 'workNumber', 'workNumber')}
      </FormikSelect>
      <div className={'flex-row whitespace-nowrap space-x-2 p-0'}>
        {selectedWork && !Array.isArray(selectedWork) && selectedWork.project.length > 0 && (
          <Pill color={'pink'}>{selectedWork.project}</Pill>
        )}
        {selectedWork && !Array.isArray(selectedWork) && selectedWork.workRequester.length > 0 && (
          <Pill color={'pink'}>{selectedWork.workRequester}</Pill>
        )}
      </div>
    </div>
  ) : (
    <>
      {!multiple ? (
        <div className={'flex flex-col'}>
          <Select
            value={!Array.isArray(selectedWork) ? selectedWork?.workNumber : ''}
            onChange={(e) => handleWorkNumberChange([e.currentTarget.value])}
            emptyOption={true}
            onBlur={validateWorkNumber}
            data-testid={'select_workNumber'}
          >
            {optionValues(works, 'workNumber', 'workNumber')}
          </Select>
          <div className={'flex-row whitespace-nowrap space-x-2 p-0'}>
            {!Array.isArray(selectedWork) && selectedWork && selectedWork.project.length > 0 && (
              <Pill color={'pink'}>{selectedWork.project}</Pill>
            )}
            {!Array.isArray(selectedWork) && selectedWork && selectedWork.workRequester.length > 0 && (
              <Pill color={'pink'}>{selectedWork.workRequester}</Pill>
            )}
          </div>
        </div>
      ) : (
        <MultiSelect
          options={works.map((work) => {
            return {
              value: work.workNumber,
              key: work.workNumber,
              label: work.workNumber
            };
          })}
          onBlur={validateWorkNumber}
          data-testid={'select_workNumber'}
          notifySelection={handleWorkNumberChange}
        />
      )}
      {error.length ? <p className="text-red-500 text-xs italic">{error}</p> : ''}
    </>
  );
}
