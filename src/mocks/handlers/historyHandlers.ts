import { graphql } from "msw";
import {
  FindHistoryForDonorNameQuery,
  FindHistoryForDonorNameQueryVariables,
  FindHistoryForExternalNameQuery,
  FindHistoryForExternalNameQueryVariables,
  FindHistoryForLabwareBarcodeQuery,
  FindHistoryForLabwareBarcodeQueryVariables,
  FindHistoryForSampleIdQuery,
  FindHistoryForSampleIdQueryVariables,
  HistoryEntry,
  HistoryFieldsFragment,
} from "../../types/sdk";
import labwareFactory from "../../lib/factories/labwareFactory";
import { buildLabwareFragment } from "../../lib/helpers/labwareHelper";
import { sampleFactory } from "../../lib/factories/sampleFactory";

function buildHistory(): HistoryFieldsFragment {
  const sourceLabware = labwareFactory.build();
  const destinationLabware = labwareFactory.build();
  const sample = sampleFactory.build();

  const entries: Array<HistoryEntry> = [
    {
      __typename: "HistoryEntry",
      destinationLabwareId: destinationLabware.id,
      sourceLabwareId: sourceLabware.id,
      eventId: 1,
      sampleId: sample.id,
      time: new Date().toISOString(),
      type: "Eat",
      username: "user1",
      details: ["Taste: Great", "Monkey: Foo"],
    },
  ];

  return {
    __typename: "History",
    samples: [sample],
    labware: [sourceLabware, destinationLabware].map(buildLabwareFragment),
    entries,
  };
}

const historyHandlers = [
  graphql.query<
    FindHistoryForDonorNameQuery,
    FindHistoryForDonorNameQueryVariables
  >("FindHistoryForDonorName", (req, res, ctx) => {
    return res(
      ctx.data({
        __typename: "Query",
        historyForDonorName: buildHistory(),
      })
    );
  }),

  graphql.query<
    FindHistoryForExternalNameQuery,
    FindHistoryForExternalNameQueryVariables
  >("FindHistoryForExternalName", (req, res, ctx) => {
    return res(
      ctx.data({
        __typename: "Query",
        historyForExternalName: buildHistory(),
      })
    );
  }),

  graphql.query<
    FindHistoryForLabwareBarcodeQuery,
    FindHistoryForLabwareBarcodeQueryVariables
  >("FindHistoryForLabwareBarcode", (req, res, ctx) => {
    return res(
      ctx.data({
        __typename: "Query",
        historyForLabwareBarcode: buildHistory(),
      })
    );
  }),

  graphql.query<
    FindHistoryForSampleIdQuery,
    FindHistoryForSampleIdQueryVariables
  >("FindHistoryForSampleId", (req, res, ctx) => {
    return res(
      ctx.data({
        __typename: "Query",
        historyForSampleId: buildHistory(),
      })
    );
  }),
];

export default historyHandlers;
