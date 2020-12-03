import React from "react";
import { Maybe, Slot as SlotModel } from "../types/graphql";
import classNames from "classnames";
import { labwareAddresses } from "../lib/helpers/labwareHelper";
import {
  AnyLabware,
  FriendlyAddress,
  LabwareAddress,
  SourcePlanRequestAction,
} from "../types/stan";

interface LabwareProps {
  labware: AnyLabware;
  actions?: Map<FriendlyAddress, SourcePlanRequestAction>;
  sampleColors?: Map<number, string>;
  onClick?: (labware: AnyLabware) => void;
  onSlotClick?: (labwareAddress: LabwareAddress) => void;
}

const Labware: React.FC<LabwareProps> = ({
  labware,
  actions,
  sampleColors,
  onClick,
  onSlotClick,
}) => {
  const { labwareType } = labware;

  const labwareClassNames = classNames(
    {
      "grid-rows-1": labwareType.numRows === 1,
      "grid-rows-2": labwareType.numRows === 2,
      "grid-rows-3": labwareType.numRows === 3,
      "grid-rows-4": labwareType.numRows === 4,
      "grid-rows-5": labwareType.numRows === 5,
      "grid-rows-6": labwareType.numRows === 6,
      "grid-cols-1": labwareType.numColumns === 1,
      "grid-cols-2": labwareType.numColumns === 2,
      "hover:bg-blue-200 cursor-pointer": !!onClick,
    },
    "py-8 px-2 grid grid-flow-col gap-4 bg-blue-100 rounded-lg transition duration-300 ease-in-out"
  );

  return (
    <div className="w-48">
      <div
        className={labwareClassNames}
        onClick={() => onClick && onClick(labware)}
      >
        {labwareAddresses(labware).map((labwareAddress, i) => (
          <Address
            key={i}
            sampleColors={sampleColors}
            labwareAddress={labwareAddress}
            onClick={onSlotClick}
            actions={actions}
          />
        ))}
      </div>
    </div>
  );
};

export default Labware;

interface AddressProps {
  labwareAddress: LabwareAddress;
  sampleColors?: Map<number, string>;
  actions?: Map<FriendlyAddress, SourcePlanRequestAction>;
  onClick?: (labwareAddress: LabwareAddress) => void;
}

const Address: React.FC<AddressProps> = ({
  labwareAddress,
  sampleColors,
  actions,
  onClick,
}) => {
  const defaultBackgroundColor = "#FFF";
  let backgroundColor = defaultBackgroundColor;
  const sampleId = actions?.get(labwareAddress.friendlyAddress)?.sampleId;

  if (sampleId && sampleColors?.has(sampleId)) {
    backgroundColor = sampleColors.get(sampleId) ?? defaultBackgroundColor;
  }

  const addressClassNames = classNames(
    {
      "transition duration-150 ease-in-out hover:bg-gray-200 cursor-pointer": !!onClick,
      "text-gray-100": backgroundColor !== defaultBackgroundColor,
      "text-gray-800": backgroundColor === defaultBackgroundColor,
    },
    "inline-flex items-center justify-center mx-auto h-20 w-20 rounded-full border border-gray-800 text-xs font-semibold"
  );

  return (
    <span
      onClick={() => onClick && onClick(labwareAddress)}
      className={addressClassNames}
      style={{ backgroundColor }}
    >
      {/* If there's an action associated with this address, show that */}
      {actions?.has(labwareAddress.friendlyAddress) && (
        <Action action={actions.get(labwareAddress.friendlyAddress) ?? null} />
      )}

      {/* If there's no action associated with this address, but there is a slot show that */}
      {!actions?.has(labwareAddress.friendlyAddress) && labwareAddress.slot && (
        <Slot slot={labwareAddress.slot} />
      )}

      {/* Otherwise, show the friendly address */}
      {!actions?.has(labwareAddress.friendlyAddress) &&
        !labwareAddress.slot &&
        labwareAddress.friendlyAddress}
    </span>
  );
};

interface ActionProps {
  action: Maybe<SourcePlanRequestAction>;
}

const Action: React.FC<ActionProps> = ({ action }) => {
  if (!action) {
    return null;
  }
  return <span>{action.source.barcode}</span>;
};

interface SlotProps {
  slot: SlotModel;
}

const Slot: React.FC<SlotProps> = ({ slot }) => {
  return <span>{slot.samples[0].tissue.externalName}</span>;
};
