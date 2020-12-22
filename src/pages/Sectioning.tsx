import React from "react";
import { useMachine } from "@xstate/react";
import Plan from "./sectioning/Plan";
import Confirm from "./sectioning/Confirm";
import { createSectioningMachine } from "../lib/machines/sectioning/sectioningMachine";
import ConfirmedOperation from "./ConfirmedOperation";

function Sectioning() {
  const [current, send] = useMachine(createSectioningMachine());

  if (current.matches("confirming")) {
    return <Confirm current={current} send={send} />;
  } else if (current.matches("done") && current.context.confirmedOperation) {
    return (
      <ConfirmedOperation
        title={"Sectioning - Complete"}
        confirmedOperation={current.context.confirmedOperation}
      />
    );
  } else {
    return <Plan current={current} send={send} />;
  }
}

export default Sectioning;
