import React, { useCallback, useEffect, useState } from 'react';
import { WorkStatus } from '../types/sdk';
import { stanCore } from '../lib/sdk';
import Pill from './Pill';
import { alphaNumericSortDefault } from '../types/stan';
import CustomReactSelect from './forms/CustomReactSelect';
import { selectOptionValues } from './forms';

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

  /**Is this SGP a required field**/
  requiredField?: boolean;

  /**Test ID**/
  dataTestId?: string;

  /**Work numbers to display as options, if not given it will be fetched using GetAllWorkInfo query**/
  worksInfoOptions?: Array<WorkInfo>;
  fixedWidth?: number;
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
  dataTestId,
  multiple = false,
  emptyOption = true,
  requiredField = true,
  worksInfoOptions,
  fixedWidth
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  /**
   * State for validating select field
   */
  const [error, setError] = useState<string>('');
  /**
   * Fetch all works and set them to state
   */
  useEffect(() => {
    /**
     * isMounted is used to avoid “Can’t perform a React state update on an unmounted component” warning
     * This happens when you make an async call inside a component and the component which made call gets
     * unmounted due to some user action. The async call responds after the unmount and setState function will
     * be called in an unmounted component in this case.
     */
    let isMounted = true;

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
      /**Only update state if it is mounted **/
      if (isMounted) {
        setAllWorks(works);
      }
    }
    if (worksInfoOptions) {
      setAllWorks(worksInfoOptions);
    } else {
      fetchAllWorkNumbers();
    }
    /**Unmount call, cleanup by setting mount status to false**/
    return () => {
      isMounted = false;
    };
  }, [setAllWorks, worksInfoOptions]);

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
  }, [setWorks, workNumberType, allWorks]);

  useEffect(() => {
    if (!workNumber) {
      setSelectedWork(undefined);
      return;
    }
    const work = works.find((work) => work.workNumber === workNumber);
    if (work) {
      setSelectedWork(work);
    }
  }, [workNumber, works, setSelectedWork, multiple]);

  /**
   * Callback for when the select changes
   */
  const handleWorkNumberChange = useCallback(
    (selectedWorkNumbers: string[], selectedIndex?: number) => {
      if (multiple) {
        setSelectedWork(
          works.filter((work) => selectedWorkNumbers.some((workNumber) => workNumber === work.workNumber))
        );
        onWorkNumberChangeInMulti?.(selectedWorkNumbers);
      } else {
        let selectedVal = selectedWorkNumbers.length > 0 ? selectedWorkNumbers[0] : '';
        const work = works.find((work) => work.workNumber === selectedVal);
        setSelectedWork(work);
        onWorkNumberChange?.(selectedVal);
      }
      setSelectedIndex(selectedIndex ?? 0);
    },
    [onWorkNumberChange, setSelectedWork, works, onWorkNumberChangeInMulti, multiple, setSelectedIndex]
  );

  const currentSelectedWork = Array.isArray(selectedWork)
    ? selectedWork.length > 0
      ? selectedWork[selectedIndex >= 0 ? selectedIndex : selectedWork.length - 1]
      : undefined
    : selectedWork;

  const validateWorkNumber = () => {
    if (multiple) {
      if (!currentSelectedWork && requiredField) {
        setError('At least one work number must be selected');
      }
    } else {
      if (!currentSelectedWork && requiredField) {
        setError('SGP number is required');
      } else {
        setError('');
      }
    }
  };
  return (
    <div className={'flex flex-col'}>
      <CustomReactSelect
        label={label ?? ''}
        name={name ?? undefined}
        emptyOption={emptyOption}
        onBlur={validateWorkNumber}
        handleChange={(val) =>
          handleWorkNumberChange(val ? (Array.isArray(val) ? val.map((val) => val.value) : [val?.value]) : [])
        }
        className={'flex-grow w-full'}
        dataTestId={dataTestId ?? 'workNumber'}
        options={selectOptionValues(works, 'workNumber', 'workNumber', true, {
          sort: true,
          sortType: 'Descending',
          alphaFirst: true
        })}
        isMulti={multiple}
        value={workNumber}
        aria-label="work-number"
        fixedWidth={fixedWidth}
      />
      {!name && error.length ? <p className="text-red-500 text-xs italic">{error}</p> : ''}
      <div className={'flex-row whitespace-nowrap space-x-2 p-0'}>
        {currentSelectedWork && currentSelectedWork.project.length > 0 && (
          <Pill color={'pink'}>{currentSelectedWork.project}</Pill>
        )}
        {currentSelectedWork && currentSelectedWork.workRequester.length > 0 && (
          <Pill color={'pink'}>{currentSelectedWork.workRequester}</Pill>
        )}
      </div>
    </div>
  );
}
