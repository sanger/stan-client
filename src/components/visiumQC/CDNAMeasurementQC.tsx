import Panel from "../Panel";
import BlueButton from "../buttons/BlueButton";
import { VisiumQCData } from "../../pages/VisiumQC";
import React, { useContext, useEffect, useState } from "react";
import {
  LabwareFieldsFragment,
  OpWithSlotMeasurementsRequest,
  RecordOpWithSlotMeasurementsMutation,
  SlotMeasurementRequest,
} from "../../types/sdk";
import { StanCoreContext } from "../../lib/sdk";
import { useMachine } from "@xstate/react";
import createFormMachine from "../../lib/machines/form/formMachine";
import Labware from "../labware/Labware";
import { isSlotFilled } from "../../lib/helpers/slotHelper";
import RemoveButton from "../buttons/RemoveButton";
import { useLabwareContext } from "../labwareScanner/LabwareScanner";
import { FormikErrors, useFormikContext } from "formik";
import SlotMeasurements from "../slotMeasurement/SlotMeasurements";
import { ClientError } from "graphql-request";
import Warning from "../notifications/Warning";

/***
 * Component to handle cDNAAmplification and cDNAAnalysis QCTypes
 * @param measurementName - Name of slot measurement to be recorded
 * @param qcType - QC Type
 * @param onSuccess - Callback to notify parent on save
 * @param onError - Callback to notify parent on srror
 * @param applySameValueForAlMeasurements - Flag to indicate whether an input is required to set all measurement values
 * @param stepIncrement - Step increment for measurement value
 * @param initialMeasurementVal - initial value for measurement value
 * @param validateMeasurementValue - Validate function for measurement value
 * @constructor
 */
const CDNAMeasurementQC = ({
  measurementName,
  qcType,
  onSave,
  onError,
  applySameValueForAlMeasurements,
  stepIncrement,
  initialMeasurementVal,
  validateMeasurementValue,
}: {
  measurementName: string;
  qcType: string;
  onSave: () => void;
  onError: (error: ClientError) => void;
  applySameValueForAlMeasurements: boolean;
  stepIncrement?: string;
  initialMeasurementVal?: string;
  validateMeasurementValue?: (value: string) => void;
}) => {
  const { values, errors, validateForm, setErrors } = useFormikContext<
    VisiumQCData
  >();

  const { labwares, removeLabware } = useLabwareContext();

  const stanCore = useContext(StanCoreContext);

  const [slotMeasurements, setSlotMeasurements] = useState<
    SlotMeasurementRequest[]
  >([]);
  const [validationError, setValidationError] = useState("");

  /***State machine**/
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
   * Initializing SlotMeasurement values
   * **/
  const buildSlotMeasurements = React.useCallback(
    (labware: LabwareFieldsFragment): SlotMeasurementRequest[] => {
      return labware.slots.filter(isSlotFilled).map((slot) => ({
        address: slot.address,
        name: measurementName,
        value: initialMeasurementVal ?? "",
      }));
    },
    [initialMeasurementVal, measurementName]
  );

  /***
   * When labwares changes, slotMeasurements need to be updated
   */
  useEffect(() => {
    setSlotMeasurements(
      labwares.length > 0 ? buildSlotMeasurements(labwares[0]) : []
    );
  }, [labwares, setSlotMeasurements, buildSlotMeasurements]);

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

  /***
   * Reset form errors on QCType chnage
   */
  useEffect(() => {
    if (!qcType) return;

    setErrors({});
  }, [qcType, setErrors]);

  /***
   * Callback to handle Save action
   * **/
  const handleSave = async () => {
    //Validate form as the Save button is not implemented as a typical Formit Submit button
    await validateForm();

    //If errors are in form data, notify user
    if (errors.slotMeasurements && errors.slotMeasurements.length > 0) {
      if (Array.isArray(errors.slotMeasurements)) {
        const failedIndices: number[] = [];
        errors.slotMeasurements.forEach(
          (
            val: FormikErrors<SlotMeasurementRequest> | string,
            indx: number
          ) => {
            if (val) {
              failedIndices.push(indx);
            }
          }
        );
        const addresses = failedIndices
          .map((failedIndx) => slotMeasurements[failedIndx].address)
          .join(",");
        setValidationError(`Invalid value format for: ${addresses}`);
      }
      return;
    }
    //No errors,save the result
    send({
      type: "SUBMIT_FORM",
      values: {
        workNumber: values.workNumber,
        barcode: labwares[0].barcode,
        slotMeasurements: slotMeasurements ?? [],
        operationType: qcType,
      },
    });
  };

  /***
   * Callback to handle change in measurement value
   * **/
  const handleChangeMeasurement = React.useCallback(
    (address: string, measurementValue: string) => {
      //reset errors fom previous edit
      setValidationError("");

      setSlotMeasurements((prevSlotMeasurements) => {
        if (!prevSlotMeasurements) return [];
        let slotMeasurements = [...prevSlotMeasurements];
        const indx = slotMeasurements.findIndex(
          (measurement) => measurement.address === address
        );
        if (indx >= 0) {
          slotMeasurements[indx].value = measurementValue;
          slotMeasurements[indx].name = measurementName;
        } else {
          slotMeasurements.push({
            address: address,
            value: measurementValue,
            name: measurementName,
          });
        }
        return [...slotMeasurements];
      });
    },
    [setSlotMeasurements, measurementName, setValidationError]
  );

  /***
   * Callback to handle change in all measurement values
   * **/
  const handleChangeAllMeasurements = React.useCallback(
    (measurementValue: string) => {
      //Reset errors from previous edits
      setValidationError("");
      setErrors({});

      setSlotMeasurements((prevSlotMeasurements) => {
        let slotMeasurements = [...prevSlotMeasurements];
        slotMeasurements.forEach((measurement) => {
          measurement.value = measurementValue;
        });
        return [...slotMeasurements];
      });
    },
    [setSlotMeasurements, setErrors, setValidationError]
  );

  /***
   * Utility function to check for empty slot measurement values
   * @param slotMeasurements
   */
  const isEmptyCQValueExists = (slotMeasurements: SlotMeasurementRequest[]) => {
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
            {applySameValueForAlMeasurements && (
              <div className={"flex flex-row w-1/4 ml-2"}>
                <label className={" mt-2"}>{measurementName}</label>
                <input
                  className={"rounded-md ml-3"}
                  type={"number"}
                  data-testid={"allMeasurementValue"}
                  onChange={(e: any) => {
                    if (!Number.isInteger(Number(e.currentTarget.value)))
                      return;
                    handleChangeAllMeasurements(e.currentTarget.value);
                  }}
                  min={0}
                />
              </div>
            )}
            <div className={"flex flex-row mt-8 justify-between"}>
              {slotMeasurements && slotMeasurements.length > 0 && (
                <SlotMeasurements
                  slotMeasurements={slotMeasurements}
                  measurementName={measurementName}
                  onChangeMeasurement={handleChangeMeasurement}
                  validateValue={validateMeasurementValue}
                  stepIncrement={stepIncrement ?? "1"}
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
      {validationError && (
        <Warning message={`Error in ${measurementName} fields`}>
          {validationError}
        </Warning>
      )}
      <div className={"mt-4 flex flex-row items-center justify-end"}>
        <BlueButton
          disabled={
            labwares.length <= 0 ||
            !slotMeasurements ||
            isEmptyCQValueExists(slotMeasurements)
          }
          type={"submit"}
          onClick={handleSave}
        >
          Save
        </BlueButton>
      </div>
    </div>
  );
};
export default CDNAMeasurementQC;
