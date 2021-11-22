import { VisiumQCTypeProps } from "./VisiumQCType";
import Panel from "../Panel";
import BlueButton from "../buttons/BlueButton";
import { QCType, VisiumQCData } from "../../pages/VisiumQC";
import React, { useContext, useEffect, useState } from "react";
import {
  LabwareFieldsFragment,
  RecordVisiumQcMutation,
  ResultRequest,
} from "../../types/sdk";
import { StanCoreContext } from "../../lib/sdk";
import { useMachine } from "@xstate/react";
import createFormMachine from "../../lib/machines/form/formMachine";
import Labware from "../labware/Labware";
import { isSlotFilled } from "../../lib/helpers/slotHelper";
import DataTable from "../DataTable";
import { Row } from "react-table";
import RemoveButton from "../buttons/RemoveButton";
import { useLabwareContext } from "../labwareScanner/LabwareScanner";
import { useFormikContext } from "formik";
type SampleResult = {
  address: string;
  cqValue: number | undefined;
};

type LabwareResult = {
  barcode: String;
  sampleResults: Array<SampleResult>;
};

const CDNAAmplification = ({ onSave, onError }: VisiumQCTypeProps) => {
  const { values } = useFormikContext<VisiumQCData>();
  const [labwareResult, setLabwareResult] = useState<LabwareResult>();
  const { labwares, removeLabware } = useLabwareContext();
  const stanCore = useContext(StanCoreContext);

  const [current, send] = useMachine(
    createFormMachine<ResultRequest, RecordVisiumQcMutation>().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.RecordVisiumQC({
            request: e.values,
          });
        },
      },
    })
  );
  const { serverError } = current.context;

  /***
   * When labwares changes ,the labwareResults has to be updated accordingly
   */
  useEffect(() => {
    setLabwareResult(
      labwares.length > 0 ? buildLabwareResult(labwares[0]) : undefined
    );
  }, [labwares, setLabwareResult]);

  /***
   * Save(/Recording) operation completed.
   * Notify the parent component with the outcome of Save operation
   */
  useEffect(() => {
    if (current.matches("submitted")) {
      onSave();
    }
    if (serverError) {
      onError(serverError);
    }
  }, [current, serverError, onSave, onError]);

  function buildLabwareResult(labware: LabwareFieldsFragment): LabwareResult {
    return {
      barcode: labware.barcode,
      sampleResults: labware.slots.filter(isSlotFilled).map((slot) => ({
        address: slot.address,
        cqValue: undefined,
      })),
    };
  }
  const handleChangeCQValue = React.useCallback(
    (address: string, cqValue: number) => {
      setLabwareResult((prevLaqbwareResult) => {
        if (!prevLaqbwareResult) return { barcode: "", sampleResults: [] };
        let sampleResults = [...prevLaqbwareResult.sampleResults];
        const indx = sampleResults.findIndex(
          (result) => result.address === address
        );
        if (indx >= 0) {
          sampleResults[indx].cqValue = cqValue;
        } else {
          sampleResults.push({ address: address, cqValue: cqValue });
        }
        return { ...prevLaqbwareResult, sampleResults: sampleResults };
      });
    },
    [setLabwareResult]
  );

  const handleChangeAllCQValue = React.useCallback(
    (cqValue: number) => {
      if (!labwareResult) return;
      let sampleResults = [...labwareResult.sampleResults];
      sampleResults.forEach((sampleResult) => {
        sampleResult.cqValue = cqValue;
      });
      setLabwareResult({ ...labwareResult, sampleResults: sampleResults });
    },
    [labwareResult, setLabwareResult]
  );

  const columns = React.useMemo(() => {
    return [
      {
        Header: "Address",
        id: "address",
        accessor: (result: SampleResult) => result.address,
      },
      {
        Header: "CQ",
        id: "cq",
        Cell: ({ row }: { row: Row<SampleResult> }) => {
          return (
            <input
              className={"rounded-md"}
              data-testid={"cqInput"}
              type={"number"}
              onChange={(e) =>
                handleChangeCQValue(
                  row.original.address,
                  Number(e.currentTarget.value)
                )
              }
              value={row.original.cqValue}
            />
          );
        },
      },
    ];
  }, [handleChangeCQValue]);

  const isEmptyCQValueExists = (labwareResult: LabwareResult) => {
    const val = labwareResult.sampleResults.filter(
      (sampleResult) =>
        sampleResult.cqValue === undefined ||
        String(sampleResult.cqValue) === ""
    );
    return val.length > 0;
  };
  return (
    <div className="max-w-screen-xl mx-auto">
      {labwares.length > 0 && (
        <div className={"flex flex-col mt-2"}>
          <Panel>
            <div className="flex flex-row items-center justify-end">
              {
                <RemoveButton
                  data-testid={"remove"}
                  onClick={() => removeLabware(labwares[0].barcode)}
                />
              }
            </div>
            <div className={"flex flex-col w-1/4"}>
              <label> CQ Value</label>
              <input
                className={"rounded-md"}
                type={"number"}
                data-testid={"cqInputAll"}
                onChange={(e) =>
                  handleChangeAllCQValue(Number(e.currentTarget.value))
                }
              />
            </div>
            <div className={"flex flex-row mt-8 justify-between"}>
              {labwareResult && (
                <DataTable
                  columns={columns}
                  data={labwareResult.sampleResults}
                />
              )}
              <div className="flex flex-col" data-testid={"labware"}>
                <Labware
                  labware={labwares[0]}
                  selectable="non_empty"
                  selectionMode="multi"
                  name={labwares[0].labwareType.name}
                />
              </div>
            </div>
          </Panel>
        </div>
      )}

      <div className={"mt-4 flex flex-row items-center justify-end"}>
        <BlueButton
          disabled={
            labwares.length <= 0 ||
            !labwareResult ||
            isEmptyCQValueExists(labwareResult)
          }
          onClick={() => {
            send({
              type: "SUBMIT_FORM",
              values: {
                workNumber: values.workNumber,
                labwareResults: [],
                operationType: QCType.SLIDE_PROCESSING,
              },
            });
          }}
        >
          Save
        </BlueButton>
      </div>
    </div>
  );
};
export default CDNAAmplification;
