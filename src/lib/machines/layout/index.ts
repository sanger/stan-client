import { LayoutEvents } from './layoutEvents';
import { LayoutContext } from './layoutContext';
import { LayoutSchema } from './layoutStates';
import { createLayoutMachine } from './layoutMachine';
import { ActorRef, Interpreter } from 'xstate';

export type LayoutMachineType = Interpreter<LayoutContext, LayoutSchema, LayoutEvents>;

export type LayoutMachineActorRef = ActorRef<LayoutEvents, LayoutMachineType['state']>;

export default createLayoutMachine;

export type { LayoutSchema, LayoutContext, LayoutEvents };
