import { MachineOptions } from "xstate";
import { assign } from "@xstate/immer";
import { SectioningOutcomeContext } from "./sectioningOutcomeContext";
import { SectioningOutcomeEvents } from "./sectioningOutcomeEvents";

export enum Actions {}

export enum Activities {}

export enum Delays {}

export enum Guards {}

export enum Services {}

export const machineOptions: Partial<MachineOptions<
  SectioningOutcomeContext,
  SectioningOutcomeEvents
>> = {
  actions: {},
  activities: {},
  delays: {},
  guards: {},
  services: {},
};
