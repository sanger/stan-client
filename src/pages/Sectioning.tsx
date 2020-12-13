import React, { useRef } from "react";
import { useMachine } from "@xstate/react";
import createSectioningMachine from "../lib/machines/sectioning";
import Prep from "./sectioning/Prep";
import Outcomes from "./sectioning/Outcomes";

function Sectioning() {
  const [current, send] = useMachine(createSectioningMachine());

  if (!current.matches("outcome")) {
    return <Prep current={current} send={send} />;
  } else {
    return <Outcomes current={current} send={send} />;
  }
}

export default Sectioning;
