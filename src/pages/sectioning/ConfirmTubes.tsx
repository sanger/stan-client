export {};
// import React, { useCallback, useContext, useEffect } from "react";
// import { useMachine, useSelector } from "@xstate/react";
// import classNames from "classnames";
// import Table, {
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
// } from "../../components/Table";
// import RemoveIcon from "../../components/icons/RemoveIcon";
// import { createSectioningConfirmMachine } from "../../lib/machines/sectioning/sectioningConfirm/sectioningConfirmMachine";
// import { LayoutPlan } from "../../lib/machines/layout/layoutContext";
// import { SectioningPageContext } from "../Sectioning";
// import {
//   buildSlotColor,
//   buildSlotSecondaryText,
//   buildSlotText,
//   selectConfirmOperationLabware,
// } from "./index";
// import { Input } from "../../components/forms/Input";
// import Modal, { ModalBody, ModalFooter } from "../../components/Modal";
// import Heading from "../../components/Heading";
// import LayoutPlanner from "../../components/LayoutPlanner";
// import BlueButton from "../../components/buttons/BlueButton";
// import WhiteButton from "../../components/buttons/WhiteButton";
// import PinkButton from "../../components/buttons/PinkButton";
// import Labware from "../../components/labware/Labware";
//
// interface ConfirmTubesProps {
//   layoutPlans: Array<LayoutPlan>;
// }
//
// const ConfirmTubes: React.FC<ConfirmTubesProps> = ({ layoutPlans }) => {
//   return (
//     <div className="p-4 lg:w-2/3 lg:mx-auto rounded-lg bg-gray-100 space-y-4">
//       <div>
//         <p className="text-gray-800 text-sm leading-normal">
//           For any tubes that were created but did not receive any sections, you
//           can mark them as{" "}
//           <span className="font-bold text-gray-900">unused</span> by clicking
//           its cancel button.
//         </p>
//       </div>
//       <div className="">
//         <Table>
//           <TableHead>
//             <tr>
//               <TableHeader />
//               <TableHeader>Tube Barcode</TableHeader>
//               <TableHeader>Section Number</TableHeader>
//               <TableHeader />
//             </tr>
//           </TableHead>
//           <TableBody>
//             {layoutPlans.map((layoutPlan, i) => (
//               <TubeRow key={i} initialLayoutPlan={layoutPlan} />
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };
//
// export default ConfirmTubes;
//
// interface TubeRowProps {
//   initialLayoutPlan: LayoutPlan;
// }
//
// const TubeRow: React.FC<TubeRowProps> = ({ initialLayoutPlan }) => {
//   const model = useContext(SectioningPageContext)!;
//   const [current, send, service] = useMachine(
//     createSectioningConfirmMachine(
//       model.context.comments,
//       initialLayoutPlan.destinationLabware,
//       initialLayoutPlan
//     )
//   );
//
//   const confirmOperationLabware = useSelector(
//     service,
//     selectConfirmOperationLabware
//   );
//
//   const commitConfirmation = model.commitConfirmation;
//
//   useEffect(() => {
//     if (confirmOperationLabware) {
//       commitConfirmation(confirmOperationLabware);
//     }
//   }, [commitConfirmation, confirmOperationLabware]);
//
//   const { cancelled, layoutPlan, labware } = current.context;
//   const { layoutMachine } = current.children;
//
//   const rowClassnames = classNames(
//     {
//       "opacity-50": cancelled,
//     },
//     "cursor-pointer hover:opacity-90 text-sm tracking-wide"
//   );
//
//   const handleOnClick = useCallback(() => {
//     send({ type: "TOGGLE_CANCEL" });
//   }, [send]);
//
//   const handleOnChange = useCallback(
//     (slotAddress: string, sectionNumber: number, sectionIndex: number) => {
//       send({
//         type: "UPDATE_SECTION_NUMBER",
//         slotAddress,
//         sectionNumber,
//         sectionIndex,
//       });
//     },
//     [send]
//   );
//
//   return (
//     <tr className={rowClassnames}>
//       <TableCell>
//         <div className="py-4 flex flex-col items-center justify-between space-y-8">
//           <Labware
//             labware={labware}
//             onClick={() => {
//               !cancelled && send({ type: "EDIT_LAYOUT" });
//             }}
//             slotText={(address) => buildSlotText(layoutPlan, address)}
//             slotSecondaryText={(address) =>
//               buildSlotSecondaryText(layoutPlan, address)
//             }
//             slotColor={(address) => buildSlotColor(layoutPlan, address)}
//           />
//
//           <PinkButton
//             disabled={current.matches("done")}
//             onClick={() => !cancelled && send({ type: "EDIT_LAYOUT" })}
//           >
//             Edit Layout
//           </PinkButton>
//         </div>
//       </TableCell>
//
//       <TableCell>
//         <span className={`${cancelled ? "line-through" : ""}`}>
//           {layoutPlan.destinationLabware.barcode}
//         </span>
//
//         {layoutMachine && (
//           <Modal show={true}>
//             <ModalBody>
//               <Heading level={3}>Set Layout</Heading>
//               {layoutMachine && (
//                 <LayoutPlanner actor={layoutMachine}>
//                   <div className="my-2">
//                     <p className="text-gray-900 text-sm leading-normal">
//                       Click a slot to increase the number of sections in that
//                       slot.
//                     </p>
//                     <p>
//                       To reduce the number of sections in a slot, use
//                       Ctrl-Click.
//                     </p>
//                   </div>
//                 </LayoutPlanner>
//               )}
//             </ModalBody>
//             <ModalFooter>
//               <BlueButton
//                 onClick={() => layoutMachine.send({ type: "DONE" })}
//                 className="w-full text-base sm:ml-3 sm:w-auto sm:text-sm"
//               >
//                 Done
//               </BlueButton>
//               <WhiteButton
//                 onClick={() => layoutMachine.send({ type: "CANCEL" })}
//                 className="mt-3 w-full sm:mt-0 sm:ml-3"
//               >
//                 Cancel
//               </WhiteButton>
//             </ModalFooter>
//           </Modal>
//         )}
//       </TableCell>
//       <TableCell>
//         {layoutPlan.plannedActions.get("A1")?.map((source, index) => (
//           <Input
//             key={source.address + String(index)}
//             type="number"
//             defaultValue={
//               source.newSection === 0 ? "" : String(source.newSection)
//             }
//             min={1}
//             disabled={cancelled}
//             // So the row click handler doesn't get triggered
//             onClick={(e) => e.stopPropagation()}
//             onChange={(e) =>
//               handleOnChange("A1", Number(e.target.value), index)
//             }
//           />
//         ))}
//       </TableCell>
//       <TableCell onClick={handleOnClick}>
//         <RemoveIcon className="h-4 w-4 text-red-500" />
//       </TableCell>
//     </tr>
//   );
// };
