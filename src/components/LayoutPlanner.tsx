import React from "react";
import { useActor } from "@xstate/react";
import { isEqual } from "lodash";
import Labware from "./labware/Labware";
import {
  LayoutEvents,
  LayoutMachineActorRef,
  LayoutMachineType,
} from "../lib/machines/layout";
import {
  selectDestination,
  selectSource,
  setAllDestinations,
} from "../lib/machines/layout/layoutEvents";
import {
  buildSlotColor,
  buildSlotSecondaryText,
  buildSlotText,
} from "../pages/sectioning/index";

interface LayoutPlannerProps {
  actor: LayoutMachineActorRef;
}

const LayoutPlanner: React.FC<LayoutPlannerProps> = ({ children, actor }) => {
  const [current, send] = useActor<LayoutEvents, LayoutMachineType["state"]>(
    actor
  );
  const { layoutPlan, selected } = current.context;

  return (
    <div>
      {children}
      <div className="my-6 md:flex md:flex-row md:items-centre md:justify-around">
        <div className="">
          {layoutPlan.destinationLabware && (
            <Labware
              labware={layoutPlan.destinationLabware}
              name={layoutPlan.destinationLabware.labwareType.name}
              selectable={"none"}
              onSlotClick={(address) => send(selectDestination(address))}
              slotText={(address) => buildSlotText(layoutPlan, address)}
              slotSecondaryText={(address) =>
                buildSlotSecondaryText(layoutPlan, address)
              }
              slotColor={(address) => buildSlotColor(layoutPlan, address)}
            />
          )}
        </div>
        {layoutPlan.sources.length > 0 && (
          <div className="mt-2 grid gap-2 grid-cols-3">
            {layoutPlan.sources.map((source, i) => (
              <div key={i} className="">
                <span
                  onClick={() => {
                    send(selectSource(source));
                  }}
                  onDoubleClick={() => {
                    send(setAllDestinations(source));
                  }}
                  className={`${
                    isEqual(source, selected) &&
                    "ring-2 ring-offset-2 ring-gray-700"
                  } bg-${layoutPlan.sampleColors.get(
                    source.sampleId
                  )}-600 inline-block py-1 px-2 rounded-full text-xs text-white font-semibold cursor-pointer select-none`}
                >
                  {source.labware.barcode}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutPlanner;
