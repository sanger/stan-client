import React from "react";
import AppShell from "../components/AppShell";
import { Form, Formik } from "formik";
import FormikInput from "../components/forms/Input";
import FormikSelect from "../components/forms/Select";
import BlueButton from "../components/buttons/BlueButton";
import { optionValues } from "../components/forms";
import DataTable from "../components/DataTable";
import { Cell, Column } from "react-table";
import StyledLink from "../components/StyledLink";
import { SearchResultTableEntry } from "../types/stan";
import LoadingSpinner from "../components/icons/LoadingSpinner";
import Warning from "../components/notifications/Warning";
import Heading from "../components/Heading";
import { FindRequest, GetSearchInfoQuery } from "../types/sdk";
import { useMachine } from "@xstate/react";
import searchMachine from "../lib/machines/search/searchMachine";
import * as Yup from "yup";
import { stringify } from "../lib/helpers";
import { history } from "../lib/sdk";

const validationSchema: Yup.ObjectSchema = Yup.object()
  .shape({
    labwareBarcode: Yup.string().ensure(),
    tissueExternalName: Yup.string().ensure(),
    donorName: Yup.string().ensure(),
  })
  .test({
    name: "atLeastOneRequired",
    test: function (value) {
      const isValid = !!(
        value?.labwareBarcode.trim() ||
        value?.tissueExternalName.trim() ||
        value?.donorName.trim()
      );

      if (isValid) return true;
      return this.createError({
        path: "labwareBarcode | tissueExternalName | donorName",
        message:
          "At least one of STAN Barcode, External Identifier, or Donor ID must not be empty.",
      });
    },
  });

type SearchProps = {
  searchInfo: GetSearchInfoQuery;
  findRequest: FindRequest;
};

function Search({ searchInfo, findRequest }: SearchProps) {
  const [current, send] = useMachine(() =>
    searchMachine.withContext({
      findRequest,
    })
  );

  const { serverError, searchResult } = current.context;

  const showWarning =
    searchResult && searchResult.numRecords > searchResult.numDisplayed;
  const showSearchResult =
    current.matches("searched") && searchResult && searchResult?.numRecords > 0;

  const onFormSubmit = (values: FindRequest) => {
    send({ type: "FIND", request: values });
    // Replace instead of push so user doesn't have to go through a load of old searches when going back
    history.replace(`/search?${stringify(values)}`);
  };

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Search</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="mx-auto max-w-screen-xl">
          <div className="mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md space-y-4">
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
              {({ errors, isValid }) => (
                <Form>
                  {!isValid && (
                    <Warning className={"mb-5"} message={"Validation Error"}>
                      {Object.values(errors)}
                    </Warning>
                  )}
                  <div className="md:grid md:grid-cols-2 md:space-y-0 md:gap-4 space-y-2">
                    <div className="">
                      <FormikInput name="labwareBarcode" label="STAN Barcode" />
                    </div>
                    <div className="">
                      <FormikInput
                        name="tissueExternalName"
                        label="External Identifier"
                      />
                    </div>
                    <div>
                      <FormikInput name="donorName" label="Donor ID" />
                    </div>
                    <div>
                      <FormikSelect
                        label="Tissue Type"
                        name="tissueType"
                        emptyOption={true}
                      >
                        {optionValues(searchInfo.tissueTypes, "name", "name")}
                      </FormikSelect>
                    </div>
                  </div>
                  <div className="sm:flex sm:flex-row sm:mt-8 mt-4 items-center justify-end">
                    <BlueButton
                      disabled={current.matches("searching")}
                      type="submit"
                    >
                      Search
                    </BlueButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <div className="my-10">
            {current.matches("searching") && (
              <div className="flex flex-row justify-center">
                <LoadingSpinner />
              </div>
            )}

            <div>
              {serverError && (
                <Warning message="Search Error" error={serverError} />
              )}
              {current.matches("searched") &&
                searchResult?.numRecords === 0 && (
                  <Warning
                    message={
                      "There were no results for the given search. Please try again."
                    }
                  />
                )}
              {showWarning && (
                <Warning
                  message={
                    "Not all results can be displayed. Please refine your search."
                  }
                />
              )}
              {showSearchResult && searchResult && (
                <div>
                  <div className="mt-6 mb-2 flex flex-row items-center justify-end">
                    <p className="text-sm text-gray-700">
                      Displaying{" "}
                      <span className="font-medium">
                        {" "}
                        {searchResult.numDisplayed}{" "}
                      </span>
                      of
                      <span className="font-medium">
                        {" "}
                        {searchResult.numRecords}{" "}
                      </span>
                      results
                    </p>
                  </div>
                  <DataTable
                    sortable
                    defaultSort={[{ id: "donorId" }]}
                    columns={columns}
                    data={searchResult.entries}
                  />
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
    Header: "Barcode",
    Cell: (props: Cell<SearchResultTableEntry>) => {
      const barcode = props.row.original.barcode;
      return <StyledLink to={`/labware/${barcode}`}>{barcode}</StyledLink>;
    },
  },
  {
    Header: "Labware Type",
    accessor: "labwareType",
  },
  {
    Header: "External ID",
    accessor: "externalId",
  },
  {
    Header: "Donor ID",
    accessor: "donorId",
  },
  {
    Header: "Tissue Type",
    accessor: "tissueType",
  },
  {
    Header: "Location",
    accessor: "location",
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
        <StyledLink
          to={`/locations/${location.barcode}?labwareBarcode=${props.row.original.barcode}`}
        >
          {linkText}
        </StyledLink>
      );
    },
  },
  {
    Header: "Section Number",
    accessor: "sectionNumber",
  },
  {
    Header: "Replicate",
    accessor: "replicate",
  },
];
