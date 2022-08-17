import React, { useContext, useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { Form, Formik } from 'formik';
import FormikInput from '../components/forms/Input';
import FormikSelect from '../components/forms/Select';
import BlueButton from '../components/buttons/BlueButton';
import { optionValues } from '../components/forms';
import DataTable from '../components/DataTable';
import { Cell, Column } from 'react-table';
import StyledLink from '../components/StyledLink';
import { SearchResultTableEntry, alphaNumericSortDefault } from '../types/stan';
import LoadingSpinner from '../components/icons/LoadingSpinner';
import Warning from '../components/notifications/Warning';
import Heading from '../components/Heading';
import { FindRequest, GetSearchInfoQuery, Work } from '../types/sdk';
import { stanCore } from '../lib/sdk';
import { useMachine } from '@xstate/react';
import * as Yup from 'yup';
import { cleanParams, objectKeys, parseQueryString, stringify } from '../lib/helpers';
import { history } from '../lib/sdk';
import WhiteButton from '../components/buttons/WhiteButton';
import { ParsedQuery } from 'query-string';
import { merge } from 'lodash';
import { configContext } from '../context/ConfigContext';
import searchMachine from '../lib/machines/search/searchMachine';
import SearchService from '../lib/services/searchService';

const validationSchema = Yup.object()
  .shape({
    // ensure transforms undefined and null to empty strings which is easier for extra validation later
    labwareBarcode: Yup.string().ensure(),
    tissueExternalName: Yup.string().ensure(),
    donorName: Yup.string().ensure(),
    tissueTypeName: Yup.string().ensure(),
    workNumber: Yup.string().ensure(),
    createdAfter: Yup.date().notRequired(),
    createdBefore: Yup.date().notRequired()
  })
  .test({
    name: 'atLeastOneRequired',
    test: function (value) {
      const isValid = !!(
        value?.labwareBarcode.trim() ||
        value?.tissueExternalName.trim() ||
        value?.donorName.trim() ||
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

const emptyFindRequest: FindRequest = {
  createdMin: '',
  createdMax: '',
  donorName: '',
  labwareBarcode: '',
  tissueExternalName: '',
  tissueTypeName: '',
  workNumber: ''
};

const emptyFindRequestKeys: Array<keyof FindRequest> = objectKeys(emptyFindRequest);

type SearchProps = {
  searchInfo: GetSearchInfoQuery;
  urlParamsString: string;
};

function Search({ searchInfo, urlParamsString }: SearchProps) {
  const params: ParsedQuery = parseQueryString(urlParamsString);
  const findRequest: FindRequest = merge({}, emptyFindRequest, cleanParams(params, emptyFindRequestKeys));

  const config = useContext(configContext)!;
  const search = searchMachine<FindRequest, SearchResultTableEntry>(new SearchService());

  const memoSearchMachine = React.useMemo(() => {
    return search.withContext({
      findRequest,
      maxRecords: config.maxSearchRecords
    });
  }, [findRequest, search, config]);
  const [current, send] = useMachine(() => memoSearchMachine);

  const { serverError, searchResult } = current.context;

  const showWarning = searchResult && searchResult.numRecords! > searchResult.numDisplayed!;
  const showSearchResult = current.matches('searched') && searchResult && searchResult?.numRecords! > 0;

  const onFormSubmit = (values: FindRequest) => {
    send({ type: 'FIND', request: values });
    // Replace instead of push so user doesn't have to go through a load of old searches when going back
    history.replace(`/search?${stringify(values)}`);
  };

  const [works, setWorks] = useState<Array<Pick<Work, 'workNumber'>>>([]);
  useEffect(() => {
    async function fetchActiveWorkNumbers() {
      const response = await stanCore.GetWorkNumbers();
      setWorks(response.works);
    }
    fetchActiveWorkNumbers();
  }, [setWorks]);

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
              {({ errors, isValid, resetForm }) => (
                <Form>
                  {!isValid && (
                    <Warning className={'mb-5'} message={'Validation Error'}>
                      {Object.values(errors)}
                    </Warning>
                  )}
                  <div className="md:grid md:grid-cols-3 md:space-y-0 md:gap-4 space-y-2">
                    <div>
                      <FormikInput name="labwareBarcode" label="STAN Barcode" />
                    </div>
                    <div className="">
                      <FormikInput name="tissueExternalName" label="External Identifier" />
                    </div>
                    <div>
                      <FormikInput name="donorName" label="Donor ID" />
                    </div>
                    <div>
                      <FormikSelect label="SGP Number" name="workNumber" emptyOption={true}>
                        {optionValues(works, 'workNumber', 'workNumber')}
                      </FormikSelect>
                    </div>
                    <div>
                      <FormikInput type="date" name="createdMin" label="Created After" />
                    </div>
                    <div>
                      <FormikInput type="date" name="createdMax" label="Created Before" />
                    </div>
                    <div>
                      <FormikSelect label="Tissue Type" name="tissueTypeName" emptyOption={true}>
                        {optionValues(searchInfo.tissueTypes, 'name', 'name')}
                      </FormikSelect>
                    </div>
                  </div>
                  <div className="sm:flex sm:flex-row sm:mt-8 mt-4 items-center justify-end">
                    <WhiteButton className="mr-4" type="button" onClick={() => resetForm({ values: emptyFindRequest })}>
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
                <Warning message={'There were no results for the given search. Please try again.'} />
              )}
              {showWarning && <Warning message={'Not all results can be displayed. Please refine your search.'} />}
              {showSearchResult && searchResult && (
                <div>
                  <div className="mt-6 mb-2 flex flex-row items-center justify-end">
                    <p className="text-sm text-gray-700">
                      Displaying <span className="font-medium"> {searchResult.numDisplayed} </span>
                      of
                      <span className="font-medium"> {searchResult.numRecords} </span>
                      results
                    </p>
                  </div>
                  <DataTable sortable defaultSort={[{ id: 'donorId' }]} columns={columns} data={searchResult.entries} />
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default Search;

const columns: Column<SearchResultTableEntry>[] = [
  {
    Header: 'Barcode',
    Cell: (props: Cell<SearchResultTableEntry>) => {
      const barcode = props.row.original.barcode;
      return <StyledLink to={`/labware/${barcode}`}>{barcode}</StyledLink>;
    }
  },
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
    Header: 'Location',
    accessor: 'location',
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
    Cell: (props: Cell<SearchResultTableEntry>) => {
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
  }
];
