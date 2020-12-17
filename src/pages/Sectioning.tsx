import React from "react";
import { useMachine } from "@xstate/react";
import Plan from "./sectioning/Plan";
import Confirm from "./sectioning/Confirm";
import { createSectioningMachine } from "../lib/machines/sectioning/sectioningMachine";

function Sectioning() {
  const [current, send] = useMachine(createSectioningMachine());

  if (!current.matches("confirming")) {
    return <Plan current={current} send={send} />;
  } else {
    return <Confirm current={current} send={send} />;
  }
}

export default Sectioning;
