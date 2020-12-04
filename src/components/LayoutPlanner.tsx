import React from "react";
import { Actor } from "xstate";
import { useActor } from "@xstate/react";
import { isEqual } from "lodash";
import Labware from "./Labware";
import { LayoutEvents, LayoutMachineType } from "../lib/machines/layout";
import {
  selectDestination,
  selectSource,
  setAllDestinations,
} from "../lib/machines/layout/layoutEvents";

interface LayoutPlannerProps {
  actor: Actor<any, any>;
}

const LayoutPlanner: React.FC<LayoutPlannerProps> = ({ actor }) => {
  const [current, send] = useActor<LayoutEvents, LayoutMachineType["state"]>(
    actor
  );
  const { layoutPlan, selected } = current.context;

  return (
    <div className="my-6 md:flex md:flex-row md:items-centre md:justify-around">
      <div className="">
        {layoutPlan.destinationLabware && (
          <Labware
            labware={layoutPlan.destinationLabware}
            actions={layoutPlan.plannedActions}
            sampleColors={layoutPlan.sampleColors}
            onSlotClick={(labwareAddress) => {
              send(selectDestination(labwareAddress));
            }}
          />
        )}
      </div>
      <div className="mt-2 grid gap-2 grid-cols-3">
        {layoutPlan.sourceActions.map((action, i) => (
          <div key={i} className="">
            <span
              onClick={() => {
                send(selectSource(action));
              }}
              onDoubleClick={() => {
                send(setAllDestinations(action));
              }}
              style={{
                backgroundColor: layoutPlan.sampleColors.get(action.sampleId),
              }}
              className={`${
                isEqual(action, selected) &&
                "ring-2 ring-offset-2 ring-gray-700"
              } inline-block py-1 px-2 rounded-full text-xs text-white font-semibold cursor-pointer select-none`}
            >
              {action.source.barcode}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutPlanner;
