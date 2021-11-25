import { VisiumQCTypeProps } from "./VisiumQCType";
import Panel from "../Panel";
import BlueButton from "../buttons/BlueButton";
import { QCType, VisiumQCData } from "../../pages/VisiumQC";
import React, { useContext, useEffect, useState } from "react";
import {
  LabwareFieldsFragment,
  OpWithSlotMeasurementsRequest,
  RecordOpWithSlotMeasurementsMutation,
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
type SlotMeasurementRequest = {
  address: string;
  name: string;
  value: string;
};

const CDNAAmplification = ({ onSave, onError }: VisiumQCTypeProps) => {
  const { values } = useFormikContext<VisiumQCData>();
  const [slotMeasurements, setSlotMeasurements] = useState<
    SlotMeasurementRequest[]
  >([]);
  const { labwares, removeLabware } = useLabwareContext();
  const stanCore = useContext(StanCoreContext);

  const measurementName = "Cq value";
  const [current, send] = useMachine(
    createFormMachine<
      OpWithSlotMeasurementsRequest,
      RecordOpWithSlotMeasurementsMutation
    >().withConfig({
      services: {
        submitForm: (ctx, e) => {
          if (e.type !== "SUBMIT_FORM") return Promise.reject();
          return stanCore.RecordOpWithSlotMeasurements({
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
    setSlotMeasurements(
      labwares.length > 0 ? buildSlotMeasurements(labwares[0]) : []
    );
  }, [labwares, setSlotMeasurements]);

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

  function buildSlotMeasurements(
    labware: LabwareFieldsFragment
  ): SlotMeasurementRequest[] {
    return labware.slots.filter(isSlotFilled).map((slot) => ({
      address: slot.address,
      name: measurementName,
      value: "",
    }));
  }

  const handleChangeCQValue = React.useCallback(
    (address: string, cqValue: number) => {
      setSlotMeasurements((prevSlotMeasurements) => {
        if (!prevSlotMeasurements) return [];
        let slotMeasurements = [...prevSlotMeasurements];
        const indx = slotMeasurements.findIndex(
          (measurement) => measurement.address === address
        );
        if (indx >= 0) {
          slotMeasurements[indx].value = String(cqValue);
          slotMeasurements[indx].name = measurementName;
        } else {
          slotMeasurements.push({
            address: address,
            value: String(cqValue),
            name: measurementName,
          });
        }
        return { ...slotMeasurements };
      });
    },
    [setSlotMeasurements]
  );

  const handleChangeAllCQValue = React.useCallback(
    (cqValue: number) => {
      debugger;
      setSlotMeasurements((prevSlotMeasurements) => {
        let slotMeasurements = [...prevSlotMeasurements];
        slotMeasurements.forEach((measurement) => {
          measurement.value = String(cqValue);
        });
        return [...slotMeasurements];
      });
    },
    [setSlotMeasurements]
  );

  const columns = React.useMemo(() => {
    return [
      {
        Header: "Address",
        id: "address",
        accessor: (measurement: SlotMeasurementRequest) => measurement.address,
      },
      {
        Header: "CQ",
        id: "cq",
        Cell: ({ row }: { row: Row<SlotMeasurementRequest> }) => {
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
              value={
                row.original.value !== "" ? Number(row.original.value) : ""
              }
            />
          );
        },
      },
    ];
  }, [handleChangeCQValue]);

  const isEmptyCQValueExists = (slotMeasurements: SlotMeasurementRequest[]) => {
    debugger;
    const val = slotMeasurements.filter(
      (measurement) => measurement.value === ""
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
              {slotMeasurements && slotMeasurements.length > 0 && (
                <DataTable columns={columns} data={slotMeasurements} />
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
            !slotMeasurements ||
            isEmptyCQValueExists(slotMeasurements)
          }
          onClick={() => {
            send({
              type: "SUBMIT_FORM",
              values: {
                workNumber: values.workNumber,
                barcode: labwares[0].barcode,
                slotMeasurements: slotMeasurements ?? [],
                operationType: QCType.CDNA_AMPLIFIFACTION,
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
