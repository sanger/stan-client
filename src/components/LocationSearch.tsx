import React from "react";
import ScanInput from "./scanInput/ScanInput";
import LabwareIcon from "./icons/LabwareIcon";
import LocationIcon from "./icons/LocationIcon";
import { history } from "../lib/sdk";

const LocationSearch: React.FC = () => {
  return (
    <div className="mt-2 my-6 border border-gray-200 bg-gray-100 p-6 rounded-md">
      <div className="sm:flex sm:flex-row items-start justify-around">
        <div className="space-y-2">
          <div className="flex flex-row items-center lg:w-96">
            <LocationIcon className="inline-block h-6 w-6 text-sdb-300" />
            <label
              htmlFor={"locationScanInput"}
              className={"w-full ml-2 font-sans font-medium text-gray-700"}
            >
              Find Location:
            </label>
          </div>
          <ScanInput
            id={"locationScanInput"}
            onScan={(value) => history.push(`/locations/${value}`)}
          />
        </div>
        <div className="mt-6 sm:mt-0 space-y-2">
          <div className="flex flex-row items-center lg:w-96">
            <LabwareIcon className="inline-block h-6 w-6 text-sdb-300" />
            <label
              htmlFor="labwareLocationScanInput"
              className={"w-full ml-2 font-sans font-medium text-gray-700"}
            >
              Find Labware:{" "}
            </label>
          </div>
          <ScanInput
            id={"labwareLocationScanInput"}
            onScan={(value) => {
              if (value.length > 0) {
                history.push(`/locations?labwareBarcode=${value}`);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationSearch;
