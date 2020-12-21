import React from "react";
import { useMachine } from "@xstate/react";
import Plan from "./sectioning/Plan";
import Confirm from "./sectioning/Confirm";
import { createSectioningMachine } from "../lib/machines/sectioning/sectioningMachine";
import SectioningDone from "./sectioning/SectioningDone";

function Sectioning() {
  const [current, send] = useMachine(createSectioningMachine());

  if (current.matches("confirming")) {
    return <Confirm current={current} send={send} />;
  } else if (current.matches("done")) {
    return <SectioningDone current={current} send={send} />;
  } else {
    return <Plan current={current} send={send} />;
  }
}

export default Sectioning;
