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
import SearchPresentationModel from "../lib/presentationModels/searchPresentationModel";
import Warning from "../components/notifications/Warning";
import Heading from "../components/Heading";

type SearchProps = {
  model: SearchPresentationModel;
};

const Search: React.FC<SearchProps> = ({ model }) => {
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
              initialValues={model.defaultFindRequest}
              validationSchema={model.validationSchema}
              validateOnChange={false}
              validateOnBlur={false}
              validateOnMount={false}
              onSubmit={model.onFormSubmit}
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
                        {optionValues(model.tissueTypes, "name", "name")}
                      </FormikSelect>
                    </div>
                  </div>
                  <div className="sm:flex sm:flex-row sm:mt-8 mt-4 items-center justify-end">
                    <BlueButton disabled={model.isButtonDisabled} type="submit">
                      Search
                    </BlueButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <div className="my-10">
            {model.showLoadingSpinner && (
              <div className="flex flex-row justify-center">
                <LoadingSpinner />
              </div>
            )}

            <div>
              {model.showServerError && (
                <Warning message="Search Error" error={model.serverError} />
              )}
              {model.showEmptyNotification && (
                <Warning
                  message={
                    "There were no results for the given search. Please try again."
                  }
                />
              )}
              {model.showWarning && (
                <Warning
                  message={
                    "Not all results can be displayed. Please refine your search."
                  }
                />
              )}
              {model.showResults && (
                <div>
                  <div className="mt-6 mb-2 flex flex-row items-center justify-end">
                    <p className="text-sm text-gray-700">
                      Displaying{" "}
                      <span className="font-medium">
                        {" "}
                        {model.searchResult.numDisplayed}{" "}
                      </span>
                      of
                      <span className="font-medium">
                        {" "}
                        {model.searchResult.numRecords}{" "}
                      </span>
                      results
                    </p>
                  </div>
                  <DataTable
                    sortable
                    defaultSort={[{ id: "donorId" }]}
                    columns={columns}
                    data={model.searchResult.entries}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Search;

const columns: Column<SearchResultTableEntry>[] = [
  {
    Header: "Barcode",
    accessor: "barcode",
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
