import React, { useCallback, useContext, useEffect } from "react";
import { useMachine, useSelector } from "@xstate/react";
import classNames from "classnames";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../../components/Table";
import RemoveIcon from "../../components/icons/RemoveIcon";
import { createSectioningConfirmMachine } from "../../lib/machines/sectioning/sectioningConfirm/sectioningConfirmMachine";
import { LayoutPlan } from "../../lib/machines/layout/layoutContext";
import { SectioningPageContext } from "../Sectioning";
import { selectConfirmOperationLabware } from "./index";
import { Input } from "../../components/forms/Input";

interface ConfirmTubesProps {
  layoutPlans: Array<LayoutPlan>;
}

const ConfirmTubes: React.FC<ConfirmTubesProps> = ({ layoutPlans }) => {
  return (
    <div className="p-4 lg:w-2/3 lg:mx-auto rounded-lg bg-gray-100 space-y-4 lg:space-y-0 lg:space-x-4 lg:grid lg:grid-cols-2">
      <div>
        <p className="text-gray-800 text-sm leading-normal">
          For any tubes that were created but did not receive any sections, you
          can mark them as{" "}
          <span className="font-bold text-gray-900">unused</span> in the table.
        </p>
      </div>
      <div className="">
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Tube Barcode</TableHeader>
              <TableHeader>Section Number</TableHeader>
              <TableHeader />
            </tr>
          </TableHead>
          <TableBody>
            {layoutPlans.map((layoutPlan, i) => (
              <TubeRow key={i} layoutPlan={layoutPlan} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ConfirmTubes;

interface TubeRowProps {
  layoutPlan: LayoutPlan;
}

const TubeRow: React.FC<TubeRowProps> = ({ layoutPlan }) => {
  const model = useContext(SectioningPageContext)!;
  const [current, send, service] = useMachine(
    createSectioningConfirmMachine(
      model.context.comments,
      layoutPlan.destinationLabware,
      layoutPlan
    )
  );

  const confirmOperationLabware = useSelector(
    service,
    selectConfirmOperationLabware
  );

  const commitConfirmation = model.commitConfirmation;

  useEffect(() => {
    if (confirmOperationLabware) {
      commitConfirmation(confirmOperationLabware);
    }
  }, [commitConfirmation, confirmOperationLabware]);

  const { cancelled } = current.context;

  const rowClassnames = classNames(
    {
      "opacity-50 line-through": cancelled,
    },
    "cursor-pointer hover:opacity-90 text-sm tracking-wide"
  );

  const handleOnClick = useCallback(() => {
    send({ type: "TOGGLE_CANCEL" });
  }, [send]);

  const handleOnChange = useCallback(
    (slotAddress: string, sectionNumber: number, sectionIndex: number) => {
      send({
        type: "UPDATE_SECTION_NUMBER",
        slotAddress,
        sectionNumber,
        sectionIndex,
      });
    },
    [send]
  );

  return (
    <tr className={rowClassnames} onClick={handleOnClick}>
      <TableCell>
        <span className="">{layoutPlan.destinationLabware.barcode}</span>
      </TableCell>
      <TableCell>
        {layoutPlan.plannedActions.get("A1")?.map((source, index) => (
          <Input
            key={source.address + String(index)}
            type="number"
            defaultValue={source.newSection ?? undefined}
            min={1}
            disabled={cancelled}
            // So the row click handler doesn't get triggered
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              handleOnChange("A1", Number(e.target.value), index)
            }
          />
        ))}
      </TableCell>
      <TableCell>
        <RemoveIcon className="h-4 w-4 text-red-500" />
      </TableCell>
    </tr>
  );
};
