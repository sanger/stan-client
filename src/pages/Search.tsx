import React, { useContext, useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import FormikInput, { Input } from '../components/forms/Input';
import BlueButton from '../components/buttons/BlueButton';
import { selectOptionValues } from '../components/forms';
import DataTable from '../components/DataTable';
import { CellProps, Column } from 'react-table';
import StyledLink from '../components/StyledLink';
import { alphaNumericSortDefault, SearchResultTableEntry } from '../types/stan';
import LoadingSpinner from '../components/icons/LoadingSpinner';
import Warning from '../components/notifications/Warning';
import Heading from '../components/Heading';
import { FindRequest, GetSearchInfoQuery, Work } from '../types/sdk';
import { stanCore } from '../lib/sdk';
import { useMachine } from '@xstate/react';
import * as Yup from 'yup';
import { getTimestampStr, objectKeys, stringify } from '../lib/helpers';
import WhiteButton from '../components/buttons/WhiteButton';
import { uniqBy } from 'lodash';
import { configContext } from '../context/ConfigContext';
import searchMachine from '../lib/machines/search/searchMachine';
import SearchService from '../lib/services/searchService';
import CustomReactSelect from '../components/forms/CustomReactSelect';
import DownloadIcon from '../components/icons/DownloadIcon';
import { useDownload } from '../lib/hooks/useDownload';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import TopScrollingBar from '../components/TopScrollingBar';
import ExternalIDFieldSearchInfo from '../components/info/ExternalFieldInfo';

export type FormFindRequest = {
  labwareBarcode?: string;
  donorNames?: string;
  tissueExternalNames?: string;
  tissueTypeName?: string;
  labwareTypeName?: string;
  species?: string;
  maxRecords?: number;
  workNumber?: string;
  createdMin?: string;
  createdMax?: string;
};

const validationSchema = Yup.object()
  .shape({
    // ensure transforms undefined and null to empty strings which is easier for extra validation later
    labwareBarcode: Yup.string().ensure(),
    tissueExternalNames: Yup.string().ensure(),
    donorNames: Yup.string().ensure(),
    tissueTypeName: Yup.string().ensure(),
    workNumber: Yup.string().ensure(),
    createdAfter: Yup.date().notRequired(),
    createdBefore: Yup.date().notRequired(),
    labwareTypeName: Yup.string().ensure(),
    species: Yup.string().ensure()
  })
  .test({
    name: 'atLeastOneRequired',
    test: function (value) {
      const isValid = !!(
        value?.labwareBarcode.trim() ||
        value?.tissueExternalNames.trim() ||
        value?.donorNames.trim() ||
        value?.tissueTypeName.trim() ||
        value?.workNumber
      );

      if (isValid) return true;
      return this.createError({
        path: 'labwareBarcode | tissueExternalName | donorName | tissueTypeName | workNumber',
        message:
          'At least one of STAN Barcode, External Identifier, Donor ID, Tissue Type or SGP Number must not be empty.'
      });
    }
  });

const emptyFindRequest: FormFindRequest = {
  createdMin: '',
  createdMax: '',
  donorNames: '',
  labwareBarcode: '',
  tissueExternalNames: '',
  tissueTypeName: '',
  labwareTypeName: '',
  workNumber: '',
  species: ''
};

const emptyFindRequestKeys: Array<keyof FindRequest> = objectKeys(emptyFindRequest);

function Search() {
  const [searchParams] = useSearchParams();
  const searchInfo = useLoaderData() as GetSearchInfoQuery;

  const findRequest = React.useMemo(() => {
    const request: FormFindRequest = emptyFindRequestKeys.reduce((request, key) => {
      const value = searchParams.get(key) ?? '';
      return { ...request, [key]: value.trim() };
    }, emptyFindRequest);
    return request;
  }, [searchParams]);

  const config = useContext(configContext)!;

  const memoSearchMachine = React.useMemo(() => {
    return searchMachine<FormFindRequest, SearchResultTableEntry>(new SearchService(), {
      findRequest,
      maxRecords: config.maxSearchRecords
    });
  }, [findRequest, config]);
  const [current, send] = useMachine(memoSearchMachine);

  const { serverError, searchResult } = current.context;

  const showWarning = searchResult && searchResult.numRecords! > searchResult.numDisplayed!;
  const showSearchResult = current.matches('searched') && searchResult && searchResult?.numRecords! > 0;

  const [downloadFileURL, setFileDownloadURL] = React.useState<string>('');

  const sortedTableDataRef = React.useRef<SearchResultTableEntry[]>([]);
  const uniqueTableDataRef = React.useRef<SearchResultTableEntry[]>([]);

  const [viewAllRecords, setViewAllRecords] = React.useState(true);
  const navigate = useNavigate();

  const onFormSubmit = (values: FormFindRequest) => {
    send({ type: 'FIND', request: values });
    // Replace instead of push so user doesn't have to go through a load of old searches when going back
    navigate(`/search?${stringify(values)}`, { replace: true });
  };

  const [works, setWorks] = useState<Array<Pick<Work, 'workNumber'>>>([]);

  const sortedWorks = () => {
    return works
      .sort((a, b) => {
        return alphaNumericSortDefault(a.workNumber, b.workNumber);
      })
      .reverse();
  };

  useEffect(() => {
    async function fetchActiveWorkNumbers() {
      const response = await stanCore.GetWorkNumbers();
      setWorks(response.works);
    }
    fetchActiveWorkNumbers();
  }, [setWorks]);

  /**
   * Rebuild the file object whenever the searchResult changes
   */
  const downloadData = React.useMemo(() => {
    return {
      columnData: {
        columns: columns
      },
      entries: searchResult ? searchResult.entries : []
    };
  }, [searchResult]);

  const { downloadURL, requestDownload, extension } = useDownload(downloadData);
  React.useEffect(() => {
    setFileDownloadURL(downloadURL);
  }, [downloadURL, setFileDownloadURL]);

  /**Memoised unique barcode data to display**/
  const memoUniqueBarcodeData = React.useMemo(() => {
    if (!searchResult) return [];
    return uniqBy(searchResult.entries, 'barcode');
  }, [searchResult]);

  /**
   * Rebuild the blob object on download action
   */
  const handleDownload = React.useCallback(async () => {
    let data;
    if (viewAllRecords) {
      data = sortedTableDataRef.current ? sortedTableDataRef.current : searchResult ? searchResult.entries : [];
    } else {
      data = uniqueTableDataRef.current ? uniqueTableDataRef.current : memoUniqueBarcodeData;
    }

    const fileurl = await requestDownload({
      columnData: {
        columns: viewAllRecords ? columns : uniqueBarcodeTableColumns
      },
      entries: viewAllRecords ? data : memoUniqueBarcodeData
    });
    setFileDownloadURL(fileurl);
  }, [searchResult, requestDownload, viewAllRecords, memoUniqueBarcodeData]);

  const numDisplayed = viewAllRecords ? searchResult?.numDisplayed : memoUniqueBarcodeData.length;
  const numRecords = viewAllRecords ? searchResult?.numRecords : memoUniqueBarcodeData.length;

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Search</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto">
          <div className="mx-auto max-w-screen-xl mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
            <Heading level={3} showBorder={false}>
              Find Stored Labware
            </Heading>
            <Formik
              initialValues={findRequest}
              validationSchema={validationSchema}
              validateOnChange={false}
              validateOnBlur={false}
              validateOnMount={false}
              onSubmit={onFormSubmit}
            >
              {({ errors, isValid, resetForm, values }) => (
                <Form>
                  {!isValid && (
                    <Warning className={'mb-5'} message={'Validation Error'}>
                      {Object.values(errors)}
                    </Warning>
                  )}
                  <div className="md:grid md:grid-cols-3 md:space-y-0 md:gap-4 space-y-2">
                    <div>
                      <FormikInput name="labwareBarcode" label="STAN Barcode" preventEnterKeyDefault={false} />
                    </div>
                    <div className="inline-block">
                      <FormikInput
                        name="tissueExternalNames"
                        label="External Identifier"
                        preventEnterKeyDefault={false}
                        info={<ExternalIDFieldSearchInfo />}
                      />
                    </div>
                    <div>
                      <FormikInput
                        name="donorNames"
                        label="Donor ID"
                        data-testid={'donor-names'}
                        preventEnterKeyDefault={false}
                        info={
                          <div className={'flex flex-col whitespace-pre-wrap space-x-2 space-y-2'}>
                            <p className={'font-medium'}>
                              The donor field supports search by multiple donors using comma separated values.
                            </p>
                            <p className={'italic text-gray-600'}>
                              E.g. to search for blocks with multiple donor names you can use{' '}
                              <span className={'text-blue-600'}>
                                <code>Donor1</code>
                              </span>
                              ,
                              <span className={'text-blue-600'}>
                                <code>Donor2</code>
                              </span>
                            </p>
                          </div>
                        }
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        dataTestId={'workNumber'}
                        label="SGP Number"
                        name="workNumber"
                        value={values.workNumber}
                        emptyOption={true}
                        options={selectOptionValues(sortedWorks(), 'workNumber', 'workNumber', true)}
                        preventEnterKeyDefault={false}
                      />
                    </div>
                    <div>
                      <FormikInput type="date" name="createdMin" label="Created After" preventEnterKeyDefault={false} />
                    </div>
                    <div>
                      <FormikInput
                        type="date"
                        name="createdMax"
                        label="Created Before"
                        preventEnterKeyDefault={false}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        dataTestId={'tissueType'}
                        label="Tissue Type"
                        name="tissueTypeName"
                        emptyOption={true}
                        value={values.tissueTypeName}
                        options={selectOptionValues(searchInfo.tissueTypes, 'name', 'name')}
                        preventEnterKeyDefault={false}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        dataTestId={'labwareTypeName'}
                        label="Labware Type"
                        name="labwareTypeName"
                        emptyOption={true}
                        value={values.labwareTypeName}
                        options={selectOptionValues(searchInfo.labwareTypes, 'name', 'name')}
                        preventEnterKeyDefault={false}
                      />
                    </div>
                    <div>
                      <CustomReactSelect
                        dataTestId={'species'}
                        label="Species"
                        name="species"
                        emptyOption={true}
                        value={values.species}
                        options={selectOptionValues(searchInfo.species, 'name', 'name')}
                        preventEnterKeyDefault={false}
                      />
                    </div>
                  </div>

                  <div className="sm:flex sm:flex-row sm:mt-8 mt-4 items-center justify-end">
                    <WhiteButton
                      className="mr-4"
                      type="button"
                      onClick={() => {
                        resetForm({ values: emptyFindRequest });
                        navigate('/search', { replace: true, state: { reset: true } });
                      }}
                    >
                      Reset
                    </WhiteButton>

                    <BlueButton disabled={current.matches('searching')} type="submit">
                      Search
                    </BlueButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <div className="my-10">
            {current.matches('searching') && (
              <div className="flex flex-row justify-center">
                <LoadingSpinner />
              </div>
            )}

            <div>
              {serverError && <Warning message="Search Error" error={serverError} />}
              {current.matches('searched') && searchResult?.numRecords === 0 && (
                <Warning message={'There is no stored labware matching your search. Please try again.'} />
              )}
              {showWarning && <Warning message={'Not all results can be displayed. Please refine your search.'} />}
              {showSearchResult && searchResult && (
                <>
                  <div className="mx-auto max-w-screen-xl border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
                    <div className="sm:flex sm:flex-col space-y-3" data-testid={'view'}>
                      <Heading level={4} showBorder={false}>
                        View
                      </Heading>
                      <div className="flex flex-col space-y-2">
                        <div className="flex flex-row space-x-2 ">
                          <Input
                            type="radio"
                            name={'view'}
                            id={'default'}
                            className="w-5 h-5 rounded-xl"
                            defaultChecked={viewAllRecords}
                            onClick={() => {
                              setViewAllRecords(true);
                            }}
                          />
                          <label>All search records</label>
                        </div>
                        <div className="flex flex-row space-x-2 ">
                          <Input
                            type="radio"
                            name={'view'}
                            id={'unique_barcode'}
                            className="w-5 h-5  rounded-xl"
                            defaultChecked={!viewAllRecords}
                            onClick={() => {
                              setViewAllRecords(false);
                            }}
                          />
                          <label>Unique barcodes only</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row justify-end mb-2">
                    <div className="mt-6 mb-2 flex flex-row items-center justify-end space-x-3">
                      <p className="text-sm text-gray-700 font-bold">{`${
                        viewAllRecords ? 'Search records' : 'Unique barcodes'
                      }`}</p>
                      <a
                        href={downloadFileURL}
                        download={`${getTimestampStr()}_dashboard_search_${extension}`}
                        onClick={handleDownload}
                        data-testid="download"
                      >
                        <DownloadIcon name="Download" className="h-4 w-4 text-sdb" />
                      </a>
                    </div>
                  </div>
                  <div>
                    <div>
                      <div className="mb-2 flex flex-row items-center justify-end">
                        <p className="text-sm italic text-gray-700">
                          Displaying <span className="font-medium"> {numDisplayed} </span>
                          of
                          <span className="font-medium"> {numRecords} </span>
                          results
                        </p>
                      </div>
                    </div>
                    <TopScrollingBar>
                      {viewAllRecords ? (
                        <DataTable
                          sortable
                          defaultSort={[{ id: 'donorId' }]}
                          columns={columns}
                          data={searchResult.entries}
                          ref={sortedTableDataRef}
                        />
                      ) : (
                        <DataTable
                          sortable
                          defaultSort={[{ id: 'barcode' }]}
                          columns={uniqueBarcodeTableColumns}
                          data={memoUniqueBarcodeData}
                          ref={uniqueTableDataRef}
                        />
                      )}
                    </TopScrollingBar>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Search;

const barcodeColumn: Column<SearchResultTableEntry> = {
  Header: 'Barcode',
  accessor: 'barcode',
  Cell: (props: CellProps<SearchResultTableEntry>) => {
    const barcode = props.row.original.barcode;
    return <StyledLink to={`/labware/${barcode}`}>{barcode}</StyledLink>;
  }
};

const locationColumn: Column<SearchResultTableEntry> = {
  Header: 'Location',
  accessor: (originalRow) => originalRow.location?.displayName,
  sortType: (rowA, rowB) => {
    const displayNameA = rowA.original.location?.displayName;
    const displayNameB = rowB.original.location?.displayName;
    if (displayNameA && displayNameB) {
      if (displayNameA > displayNameB) return 1;
      if (displayNameA < displayNameB) return -1;
      return 0;
    }
    if (displayNameA && !displayNameB) return 1;
    if (!displayNameA && displayNameB) return -1;
    return 0;
  },
  Cell: (props: CellProps<SearchResultTableEntry>) => {
    const location = props.row.original.location;

    if (!location) {
      return null;
    }

    let linkText = location.displayName;
    if (location.address) {
      linkText += `(${location.address})`;
    }

    return (
      <StyledLink to={`/locations/${location.barcode}?labwareBarcode=${props.row.original.barcode}`}>
        {linkText}
      </StyledLink>
    );
  }
};
const uniqueBarcodeTableColumns: Column<SearchResultTableEntry>[] = [
  barcodeColumn,
  {
    Header: 'Labware Type',
    accessor: 'labwareType'
  },
  locationColumn
];
const columns: Column<SearchResultTableEntry>[] = [
  barcodeColumn,
  {
    Header: 'Created',
    accessor: (originalRow) => originalRow.labwareCreated.toLocaleDateString(),
    sortType: (rowA, rowB) => {
      return rowA.original.labwareCreated.getTime() - rowB.original.labwareCreated.getTime();
    }
  },
  {
    Header: 'Labware Type',
    accessor: 'labwareType'
  },
  {
    Header: 'SGP Numbers',
    accessor: (originalRow) => originalRow.workNumbers.join(', '),
    sortType: (rowA, rowB) => {
      return alphaNumericSortDefault(rowA.original.workNumbers.join(', '), rowB.original.workNumbers.join(', '));
    }
  },
  {
    Header: 'External ID',
    accessor: 'externalId'
  },
  {
    Header: 'Donor ID',
    accessor: 'donorId'
  },
  {
    Header: 'Tissue Type',
    accessor: 'tissueType'
  },
  {
    Header: 'Section Number',
    accessor: 'sectionNumber'
  },
  {
    Header: 'Replicate',
    accessor: 'replicate'
  },
  {
    Header: 'Embedding Medium',
    accessor: 'embeddingMedium'
  },
  {
    Header: 'Fixative',
    accessor: 'fixative'
  },
  locationColumn
];
