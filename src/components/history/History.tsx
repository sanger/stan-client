import React, { useEffect, useMemo, useState } from "react";
import createHistoryMachine from "./history.machine";
import { useMachine } from "@xstate/react";
import DataTable from "../DataTable";
import { Cell, Column } from "react-table";
import { HistoryProps, HistoryTableEntry } from "../../types/stan";
import StyledLink from "../StyledLink";
import Warning from "../notifications/Warning";
import WhiteButton from "../buttons/WhiteButton";
import LoadingSpinner from "../icons/LoadingSpinner";
import { LabwareStatePill } from "../LabwareStatePill";
import { createHistoryFileContent } from "../../lib/services/historyService";
import DownloadIcon from "../icons/DownloadIcon";
import { getTimestampStr } from "../../lib/helpers";

/**
 * Component for looking up and displaying the history of labware and samples
 */
export default function History(props: HistoryProps) {
  const [current, send] = useMachine(createHistoryMachine(props));
  const [downloadURL, setDownloadURL] = useState<string>();

  const { history, historyProps, serverError } = current.context;

  /**
   * If the props change, send an update event to the machine
   */
  useEffect(() => {
    send({ type: "UPDATE_HISTORY_PROPS", props });
  }, [props, send]);

  /**
   * Rebuild the file object whenever the history changes
   */
  const historyFile = useMemo(() => {
    return new File(
      [createHistoryFileContent(historyColumns, history)],
      `${getTimestampStr()}_${historyProps.kind}_${historyProps.value}.tsv`,
      {
        type: "text/tsv",
      }
    );
  }, [history, historyProps]);

  /**
   * Whenever the history file changes we need to rebuild the download URL
   */
  useEffect(() => {
    const historyFileURL = URL.createObjectURL(historyFile);
    setDownloadURL(historyFileURL);

    /**
     * Cleanup function that revokes the URL when it's no longer needed
     */
    return () => URL.revokeObjectURL(historyFileURL);
  }, [historyFile, setDownloadURL]);

  return (
    <div data-testid="history">
      {current.matches("error") && serverError && (
        <Warning message={"History Search Error"} error={serverError}>
          <WhiteButton onClick={() => send({ type: "RETRY" })}>
            Retry
          </WhiteButton>
        </Warning>
      )}

      {current.matches("searching") && (
        <div className="flex flex-row justify-center">
          <LoadingSpinner />
        </div>
      )}

      {current.matches("found") && history.length > 0 && (
        <>
          <div className="mt-6 mb-2 flex flex-row items-center justify-end space-x-3">
            <p className="text-sm text-gray-700">
              History for {historyDisplayValues[props.kind]}{" "}
              <span className="font-medium">{props.value}</span>
            </p>
            <a href={downloadURL} download={true}>
              <DownloadIcon name="Download" className="h-4 w-4 text-sdb" />
            </a>
          </div>
          <DataTable columns={historyColumns} data={history} />
        </>
      )}
    </div>
  );
}

const historyColumns: Array<Column<HistoryTableEntry>> = [
  {
    Header: "Date",
    accessor: "date",
  },
  {
    Header: "Event Type",
    accessor: "eventType",
  },
  {
    Header: "Work number",
    accessor: "workNumber",
  },
  {
    Header: "User",
    accessor: "username",
  },
  {
    Header: "Source",
    accessor: "sourceBarcode",
    Cell: (props: Cell<HistoryTableEntry>) => {
      const barcode = props.row.original.sourceBarcode;
      return <StyledLink to={`/labware/${barcode}`}>{barcode}</StyledLink>;
    },
  },
  {
    Header: "Destination",
    accessor: "destinationBarcode",
    Cell: (props: Cell<HistoryTableEntry>) => {
      const barcode = props.row.original.destinationBarcode;
      return <StyledLink to={`/labware/${barcode}`}>{barcode}</StyledLink>;
    },
  },
  {
    Header: "Donor ID",
    accessor: "donorName",
  },
  {
    Header: "External ID",
    accessor: "externalName",
  },
  {
    Header: "Section Number",
    accessor: "sectionNumber",
  },
  {
    Header: "Biological State",
    accessor: "biologicalState",
  },
  {
    Header: "Labware State",
    accessor: "labwareState",
    Cell: (props: Cell<HistoryTableEntry>) => (
      <LabwareStatePill labware={{ state: props.row.original.labwareState }} />
    ),
  },
  {
    Header: "Details",
    accessor: "details",
    Cell: (props: Cell<HistoryTableEntry>) => {
      const details = props.row.original.details.map((detail) => {
        return <li key={detail}>{detail}</li>;
      });
      return <ul>{details}</ul>;
    },
  },
];

export const historyDisplayValues: { [key in HistoryProps["kind"]]: string } = {
  labwareBarcode: "Labware Barcode",
  sampleId: "Sample ID",
  externalName: "External ID",
  donorName: "Donor Name",
  workNumber: "Work Number",
};
