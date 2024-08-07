import React, { useEffect, useMemo } from 'react';
import createWorkAllocationMachine, { WorkAllocationFormValues } from './workAllocation.machine';
import { useMachine } from '@xstate/react';
import Table, { SortProps, TableBody, TableHead, TableHeader } from '../Table';
import Success from '../notifications/Success';
import * as Yup from 'yup';
import { UserRole, WorkStatus, WorkWithCommentFieldsFragment } from '../../types/sdk';
import { getPropertyValue, getTimestampStr, objectKeys, safeParseQueryString, stringify } from '../../lib/helpers';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTableSort } from '../../lib/hooks/useTableSort';
import { statusSort } from '../../types/stan';
import { useDownload } from '../../lib/hooks/useDownload';
import { useAuth } from '../../context/AuthContext';
import Warning from '../notifications/Warning';
import Heading from '../Heading';
import CustomReactSelect from '../forms/CustomReactSelect';
import FormikInput from '../forms/Input';
import DownloadIcon from '../icons/DownloadIcon';
import { Authenticated } from '../Authenticated';
import { Form, Formik } from 'formik';
import WorkRow from './WorkRow';
import { selectOptionValues } from '../forms';
import LoadingSpinner from '../icons/LoadingSpinner';
import BlueButton from '../buttons/BlueButton';
import InfoIcon from '../icons/InfoIcon';
import TopScrollingBar from '../TopScrollingBar';
import { stanCore } from '../../lib/sdk';
import Pill from '../Pill';
import AddNewConfigOption from './AddNewConfigOption';
import projectFactory from '../../lib/factories/projectFactory';
import costCodeFactory from '../../lib/factories/costCodeFactory';
import { useComponentVisible } from '../../lib/hooks';
import omeroProjectFactory from '../../lib/factories/omeroProjectFactory';

const initialValues: WorkAllocationFormValues = {
  workType: '',
  workRequester: '',
  costCode: '',
  project: '',
  program: '',
  isRnD: false,
  numSlides: undefined,
  numBlocks: undefined,
  numOriginalSamples: undefined,
  ssStudyId: '',
  studyName: undefined
};
export const MAX_NUM_BLOCKANDSLIDES = 200;

/**
 * Possible URL search params for the page e.g. /sgp?status[]=active&status[]=completed
 */
export type WorkAllocationUrlParams = {
  status: WorkStatus[];
};

const tableColumnFieldInfo = [
  { key: 'Priority', path: ['work', 'priority'] },
  { key: 'SGP Number', path: ['work', 'workNumber'] },
  { key: 'Work Type', path: ['work', 'workType', 'name'] },
  { key: 'Work Requester', path: ['work', 'workRequester', 'username'] },
  { key: 'Project', path: ['work', 'project', 'name'] },
  { key: 'Omero Project', path: ['work', 'omeroProject', 'name'] },
  { key: 'DNAP Study', path: ['work', 'dnapStudy', 'name'] },
  { key: 'Cost Code', path: ['work', 'costCode', 'code'] },
  { key: 'Number of Blocks', path: ['work', 'numBlocks'] },
  { key: 'Number of Slides', path: ['work', 'numSlides'] },
  { key: 'Number of Original samples', path: ['work', 'numOriginalSamples'] },
  { key: 'Status', path: ['work', 'status'] }
];

/**
 * Schema to validate the deserialized URL search params
 */
const urlParamsSchema = Yup.object().shape({
  status: Yup.array()
    .of(Yup.string().oneOf(Object.values(WorkStatus)))
    .required()
});

export default function WorkAllocation() {
  const location = useLocation();
  /**
   * The deserialized URL search params
   */
  const urlParams = useMemo(() => {
    return (
      safeParseQueryString<WorkAllocationUrlParams>({
        query: location.search,
        schema: urlParamsSchema
      }) ?? { status: [WorkStatus.Active] }
    );
  }, [location.search]);

  const workAllocationMachine = React.useMemo(() => {
    return createWorkAllocationMachine({ urlParams });
  }, [urlParams]);
  const [current, send] = useMachine(workAllocationMachine);

  /**This prevents duplicate submissions on double click**/
  const [submitted, setSubmitted] = React.useState(false);
  const {
    projects,
    programs,
    omeroProjects,
    costCodes,
    workWithComments,
    workTypes,
    workRequesters,
    availableComments,
    requestError,
    successMessage,
    allocatedWorkNumber
  } = current.context;

  /**Hook to sort table*/
  const { sortedTableData, sort, sortConfig } = useTableSort<WorkWithCommentFieldsFragment>(workWithComments, {
    sortFieldName: 'SGP Number',
    direction: 'descending',
    accessPath: ['work', 'workNumber']
  });

  const navigate = useNavigate();
  const { userRoleIncludes } = useAuth();

  /**
   * Rebuild the download data  whenever the worWithComments changes
   */
  const downloadData = React.useMemo(() => {
    return {
      columnData: {
        columnNames: tableColumnFieldInfo.map((info) => info.key)
      },
      entries: workWithComments.map((data) => {
        return tableColumnFieldInfo.map((columnInfo) => {
          return String(getPropertyValue(data, columnInfo.path));
        });
      })
    };
  }, [workWithComments]);

  /**Custom hook to download data**/
  const { downloadURL, extension } = useDownload<string[]>(downloadData);

  /**
   * When the URL search params change, send an event to the machine
   */
  useEffect(() => {
    send({ type: 'UPDATE_URL_PARAMS', urlParams });
  }, [send, urlParams]);

  /**Update the workWithComments with sort order**/
  useEffect(() => {
    send({ type: 'SORT_WORKS', workWithComments: sortedTableData });
  }, [sortedTableData, send]);

  /**Handler to update works with changes - Update work allocation data whenever any field is edited**/
  const onWorkUpdate = React.useCallback(
    (rowIndex: number, work: WorkWithCommentFieldsFragment) => {
      send({ type: 'UPDATE_WORK', workWithComment: work, rowIndex });
    },
    [send]
  );
  const [addNewProjectCodeCode, setAddNewProjectCodeCode] = React.useState(false);
  const [addNewCostCode, setAddNewCostCode] = React.useState(false);
  const [addNewOmeroProject, setAddNewOmeroProject] = React.useState(false);
  const addNewConfigOptionInputRef = React.useRef<HTMLInputElement>(null);

  /**Handler to do sorting on user action**/
  const handleSort = React.useCallback(
    (uniqueSortField: string) => {
      let customSort = uniqueSortField === 'status' ? statusSort : undefined;
      const fieldInfo = tableColumnFieldInfo.find((fieldInfo) => fieldInfo.key === uniqueSortField);
      if (!fieldInfo) {
        return;
      }
      sort(uniqueSortField, fieldInfo.path, customSort);
    },
    [sort]
  );

  /**Fill in sort properties for table**/
  const getTableSortProps = (sortFieldName: string): SortProps | undefined => {
    return {
      sortFieldName,
      ascending:
        sortConfig && sortFieldName !== sortConfig?.sortFieldName ? undefined : sortConfig?.direction === 'ascending'!!,
      sortHandler: handleSort
    };
  };

  /**
   * Form validation schema
   */
  const validationSchema = Yup.object().shape({
    workType: Yup.string()
      .oneOf(workTypes.map((wt) => wt.name))
      .required()
      .label('Work Type'),
    workRequester: Yup.string()
      .oneOf(workRequesters.map((wr) => wr.username))
      .required()
      .label('Work Requester'),
    project: Yup.string()
      .oneOf(projects.map((p) => p.name))
      .required()
      .label('Project (cost code description)'),
    program: Yup.string()
      .oneOf(programs.map((p) => p.name))
      .required()
      .label('Program'),
    costCode: Yup.string()
      .oneOf(costCodes.map((cc) => cc.code))
      .required()
      .label('Cost Code'),
    omeroProject: Yup.string()
      .oneOf(omeroProjects.map((cc) => cc.name))
      .optional()
      .label('Omero Project'),
    ssStudyId: Yup.string().label('DNAP study ID').optional(),
    isRnD: Yup.boolean().required(),
    numBlocks: Yup.number().max(MAX_NUM_BLOCKANDSLIDES),
    numSlides: Yup.number().max(MAX_NUM_BLOCKANDSLIDES),
    numOriginalSamples: Yup.number().when(['numBlocks', 'numSlides'], (fields, schema) => {
      if (!fields[0] && !fields[1])
        return Yup.number().required('Number of blocks, slides or original samples required');
      else return schema;
    })
  });

  /** Used to close the 'add new option component' whenever the user clicks outside of it. */
  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible({
    initialIsVisible: true,
    onHide: () => {
      setAddNewProjectCodeCode(false);
      setAddNewCostCode(false);
      setAddNewOmeroProject(false);
    }
  });

  return (
    <div>
      <div className="mx-auto max-w-screen-lg mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
        {successMessage && (
          <>
            <Success message={successMessage} />
            <div
              data-testid={'reminder-div'}
              className={'flex flex-row border-l-4 border-green-600 p-2 bg-green-100 text-green-800 font-medium'}
            >
              <InfoIcon className={'bg-white inline-block bg-green-100 text-green-800 h-12 w-12'} />
              <div>
                <span> Please record your work request number </span>
                <span className={'text-pink-600 font-bold'}> {` ${allocatedWorkNumber} `} </span>
                for future reference. If you mislay this information you can find your request number on the home page
                by searching using requester, program, worktype or status fields.
              </div>
            </div>
            {userRoleIncludes(UserRole.Enduser) && (
              <div
                data-testid={'reminder-div'}
                className={'flex flex-row border-l-4 border-green-600 p-2 bg-green-100 text-green-800 font-medium'}
              >
                <InfoIcon className={'bg-white inline-block bg-green-100 text-green-800 h-12 w-12'} />
                <div>
                  If you have submitted an RNAScope/IHC request, please complete the template for probes/antibody and
                  fluorophore
                  <span>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={
                        'https://fred.wellcomegenomecampus.org/Interact/Pages/Content/Document.aspx?id=6817&utm_source=interact&utm_medium=side_menu_category'
                      }
                      className="underline text-blue-600 hover:text-blue-800 font-semibold ml-1"
                    >
                      here
                    </a>
                  </span>
                  , and upload it to STAN on the file management page linked to your request number.
                </div>
              </div>
            )}
          </>
        )}
        {requestError && <Warning message={'SGP Request Error'} error={requestError} />}

        <Heading level={3} showBorder={false}>
          Allocate a new SGP number
        </Heading>

        <Formik<WorkAllocationFormValues>
          initialValues={initialValues}
          onSubmit={async (values) => {
            setSubmitted(true);
            setTimeout(() => {
              setSubmitted(false);
            }, 500);
            const valuesToSubmit = {
              ...values,
              ssStudyId: values.ssStudyId ?? undefined
            };
            send({ type: 'ALLOCATE_WORK', values: valuesToSubmit });
          }}
          validationSchema={validationSchema}
          validateOnBlur={true}
          validateOnChange={false}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div className=" md:grid md:grid-cols-3 md:px-10 sm:flex sm:flex-row md:justify-center md:items-start md:gap-y-4 md:gap-x-8">
                <div className="md:flex-grow">
                  <CustomReactSelect
                    label="Work Type"
                    name="workType"
                    emptyOption={true}
                    dataTestId={'workType'}
                    options={selectOptionValues(workTypes, 'name', 'name')}
                  />
                </div>

                <div className="md:flex-grow">
                  <CustomReactSelect
                    label="Work Requester"
                    name="workRequester"
                    dataTestId="workRequester"
                    emptyOption={true}
                    options={selectOptionValues(workRequesters, 'username', 'username', true, {
                      sort: true,
                      alphaFirst: true
                    })}
                  />
                </div>
                {addNewProjectCodeCode && isComponentVisible ? (
                  <AddNewConfigOption
                    mainDivRef={ref}
                    inputRef={addNewConfigOptionInputRef}
                    returnedDataObject="addProject"
                    onSubmit={(value: string) => {
                      return stanCore.AddProject({ name: value });
                    }}
                    onCancel={() => {
                      setAddNewProjectCodeCode(false);
                    }}
                    onSuccess={(object) => {
                      const name = object.name;
                      send({
                        type: 'ADD_NEWLY_CREATED_PROJECT',
                        project: projectFactory.build({ name: name })
                      });
                      setFieldValue('project', name);
                    }}
                    onFinish={() => {
                      setAddNewProjectCodeCode(false);
                    }}
                    configLabel="Add New Project"
                    configName="project"
                  />
                ) : (
                  <div className="md:flex-grow">
                    <CustomReactSelect
                      label="Project (cost code description)"
                      name="project"
                      dataTestId="project"
                      emptyOption={true}
                      options={selectOptionValues(projects, 'name', 'name', true, { sort: true, alphaFirst: true })}
                      value={values.project}
                      addButton={{
                        dataTestId: 'addNewProject-btn',
                        onClick: () => {
                          setAddNewProjectCodeCode(true);
                          setIsComponentVisible(true);
                        },
                        className: 'mt-4'
                      }}
                    />
                  </div>
                )}
                {addNewOmeroProject && isComponentVisible ? (
                  <AddNewConfigOption
                    mainDivRef={ref}
                    inputRef={addNewConfigOptionInputRef}
                    returnedDataObject="addOmeroProject"
                    onSubmit={(value: string) => {
                      return stanCore.AddOmeroProject({ name: value });
                    }}
                    onCancel={() => {
                      setAddNewOmeroProject(false);
                    }}
                    onSuccess={async (object) => {
                      const name = object.name;
                      send({
                        type: 'ADD_NEWLY_CREATED_OMERO_PROJECT',
                        project: omeroProjectFactory.build({ name: name })
                      });
                      await setFieldValue('omeroProject', name);
                    }}
                    onFinish={() => {
                      setAddNewOmeroProject(false);
                    }}
                    configLabel="Add New Omero Project"
                    configName="Omero Project"
                  />
                ) : (
                  <div className="md:flex-grow">
                    <CustomReactSelect
                      label="Omero Project"
                      name="omeroProject"
                      dataTestId="omeroProject"
                      emptyOption={true}
                      options={selectOptionValues(omeroProjects, 'name', 'name', true, {
                        sort: true,
                        alphaFirst: true
                      })}
                      value={values.omeroProject}
                      addButton={{
                        dataTestId: 'addNewOmeroProject-btn',
                        onClick: () => {
                          setAddNewOmeroProject(true);
                          setIsComponentVisible(true);
                        },
                        className: 'mt-4'
                      }}
                    />
                  </div>
                )}

                <div className="md:flex-grow">
                  <CustomReactSelect
                    label="Program"
                    name="program"
                    dataTestId="program"
                    emptyOption={true}
                    options={selectOptionValues(programs, 'name', 'name')}
                  />
                </div>

                {addNewCostCode && isComponentVisible ? (
                  <AddNewConfigOption
                    mainDivRef={ref}
                    inputRef={addNewConfigOptionInputRef}
                    returnedDataObject="addCostCode"
                    onSubmit={(value: string) => {
                      return stanCore.AddCostCode({ code: value });
                    }}
                    onCancel={() => {
                      setAddNewCostCode(false);
                    }}
                    onSuccess={(object) => {
                      const code = object.code;
                      send({
                        type: 'ADD_NEWLY_CREATED_COST_CODE',
                        costCode: costCodeFactory.build({ code: code })
                      });
                      setFieldValue('costCode', code);
                    }}
                    onFinish={() => {
                      setAddNewCostCode(false);
                    }}
                    configLabel="Add New Cost Code"
                    configName="costCode"
                  />
                ) : (
                  <div className="md:flex-grow">
                    <CustomReactSelect
                      label="Cost Code"
                      name="costCode"
                      dataTestId="costCode"
                      emptyOption={true}
                      options={selectOptionValues(costCodes, 'code', 'code')}
                      value={values.costCode}
                      addButton={{
                        dataTestId: 'addNewCostCode-btn',
                        onClick: () => {
                          setAddNewCostCode(true);
                          setIsComponentVisible(true);
                        },
                        className: 'mt-4'
                      }}
                    />
                  </div>
                )}

                <div className="md:flex-grow">
                  <FormikInput
                    label={'Number of original samples'}
                    name={'numOriginalSamples'}
                    type={'number'}
                    maxLength={MAX_NUM_BLOCKANDSLIDES}
                    min={0}
                  />
                </div>
                <div className="md:flex-grow">
                  <FormikInput
                    label={'Number of blocks'}
                    name={'numBlocks'}
                    type={'number'}
                    maxLength={MAX_NUM_BLOCKANDSLIDES}
                    min={0}
                  />
                </div>
                <div className="md:flex-grow">
                  <FormikInput
                    label={'Number of slides'}
                    name={'numSlides'}
                    type={'number'}
                    maxLength={MAX_NUM_BLOCKANDSLIDES}
                    min={0}
                  />
                </div>
                <div className="md:flex-grow">
                  <FormikInput
                    type={'number'}
                    label="DNAP study ID"
                    name="ssStudyId"
                    value={values.ssStudyId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const ssId = Number(e.currentTarget.value);
                      stanCore
                        .GetDnapStudy({ ssId: ssId })
                        .then((study) => {
                          if (study && study.dnapStudy) {
                            setFieldValue('studyName', study.dnapStudy.name);
                          } else {
                            setFieldValue('studyName', 'undefined');
                          }
                        })
                        .catch((e) => {
                          setFieldValue('studyName', 'undefined');
                        });
                      setFieldValue('ssStudyId', e.currentTarget.value);
                    }}
                  />
                  {values.studyName && values.ssStudyId && (
                    <div className="flex-row whitespace-nowrap space-x-2 p-0">
                      {values.studyName === 'undefined' ? (
                        <Pill color="pink">Unknown Sequencescape study id</Pill>
                      ) : (
                        <Pill color="blue">{values.studyName}</Pill>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:flex sm:flex-row mt-4 justify-end space-x-4">
                <FormikInput label={'R&D?'} name={'isRnD'} type={'checkbox'} />
                <BlueButton disabled={current.matches('allocating') || submitted} type="submit">
                  Submit
                </BlueButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <Authenticated role={UserRole.Normal}>
        <div className="mx-auto max-w-screen-lg mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
          <Heading level={3} showBorder={false}>
            Filter SGP Numbers
          </Heading>

          <Formik<WorkAllocationUrlParams>
            initialValues={urlParams}
            onSubmit={async (values) => {
              navigate({
                pathname: '/sgp',
                search: stringify(values)
              });
            }}
          >
            {({ values }) => (
              <Form>
                <div className="space-y-2 md:grid md:grid-cols-3 md:px-10 md:space-y-0 md:flex md:flex-row md:justify-center md:items-start md:gap-4">
                  <div className="md:flex-grow">
                    <CustomReactSelect
                      label="Status"
                      name="status"
                      isMulti={true}
                      dataTestId={'status'}
                      options={objectKeys(WorkStatus).map((workStatus) => {
                        return {
                          label: workStatus,
                          value: WorkStatus[workStatus]
                        };
                      })}
                      value={values.status}
                    />
                  </div>
                </div>
                <div className="sm:flex sm:flex-row mt-4 justify-end space-x-4">
                  <BlueButton disabled={current.matches('loading')} type="submit">
                    Search
                  </BlueButton>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        <div className="mx-auto max-w-screen-xl">
          {current.matches('loading') ? (
            <div className="flex flex-row items-center justify-around">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="mt-6 mb-2 flex flex-row items-center justify-end space-x-3">
                <p className="text-sm text-gray-700">Records for SGP management</p>
                <a href={downloadURL} download={`${getTimestampStr()}_sgp_management${extension}`}>
                  <DownloadIcon name="Download" className="h-4 w-4 text-sdb" />
                </a>
              </div>
              <TopScrollingBar>
                <Table data-testid="work-allocation-table">
                  <TableHead fixed={true}>
                    <tr>
                      <TableHeader sortProps={getTableSortProps('Priority')}>Priority</TableHeader>
                      <TableHeader sortProps={getTableSortProps('Status')}>Status</TableHeader>
                      <TableHeader />
                      <TableHeader sortProps={getTableSortProps('SGP Number')}>SGP Number</TableHeader>
                      <TableHeader sortProps={getTableSortProps('Work Type')}>Work Type</TableHeader>
                      <TableHeader sortProps={getTableSortProps('Work Requester')}>Work Requester</TableHeader>
                      <TableHeader sortProps={getTableSortProps('Project')}>
                        Project (cost code description)
                      </TableHeader>
                      <TableHeader sortProps={getTableSortProps('Omero Project')}>Omero Project</TableHeader>
                      <TableHeader colSpan={2} sortProps={getTableSortProps('DNAP Study ID')}>
                        DNAP Study ID
                      </TableHeader>
                      <TableHeader sortProps={getTableSortProps('Program')}>Program</TableHeader>
                      <TableHeader sortProps={getTableSortProps('Cost Code')}>Cost Code</TableHeader>
                      <TableHeader sortProps={getTableSortProps('Number of Blocks')}>Number of Blocks</TableHeader>
                      <TableHeader sortProps={getTableSortProps('Number of Slides')}>Number of Slides</TableHeader>
                      <TableHeader sortProps={getTableSortProps('Number of Original Samples')}>
                        Number of Original Samples
                      </TableHeader>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {sortedTableData.map((workWithComment, index) => (
                      <WorkRow
                        initialWork={workWithComment}
                        availableComments={availableComments}
                        availableOmeroProjects={omeroProjects}
                        key={workWithComment.work.workNumber}
                        rowIndex={index}
                        onWorkFieldUpdate={onWorkUpdate}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TopScrollingBar>
            </>
          )}
        </div>
      </Authenticated>
    </div>
  );
}
