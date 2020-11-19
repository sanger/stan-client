import { interpret } from "xstate";
import labwareMachine, {
  LabwareMachineContext,
} from "../../../src/lib/machines/labwareMachine";
import { FindLabwareQuery } from "../../../src/types/graphql";

describe("labwareMachine", () => {
  it("has an initial state of idle.normal", (done) => {
    const machine = interpret(labwareMachine).onTransition((state) => {
      if (state.matches("idle.normal")) {
        done();
      }
    });
    machine.start();
  });

  describe("UPDATE_CURRENT_BARCODE", () => {
    it("updates the current barcode", (done) => {
      const machine = interpret(labwareMachine).onTransition((state) => {
        if (
          state.matches("idle.normal") &&
          state.context.currentBarcode == "STAN-123"
        ) {
          done();
        }
      });
      machine.start();
      machine.send({ type: "UPDATE_CURRENT_BARCODE", value: "STAN-123" });
    });
  });

  describe("BARCODE_SCANNED", () => {
    context(
      "when the labware with this barcode is already in the table",
      () => {
        it("transitions to idle.error with an error message", (done) => {
          const mockLabwareTableMachine = labwareMachine.withContext(
            Object.assign({}, labwareMachine.context, {
              labwares: [
                {
                  barcode: "STAN-123",
                },
              ],
            })
          );

          const machine = interpret(mockLabwareTableMachine).onTransition(
            (state) => {
              if (state.matches("idle.error")) {
                expect(state.context.errorMessage).to.eq(
                  '"STAN-123" is already in the table'
                );
                done();
              }
            }
          );
          machine.start();
          machine.send({ type: "UPDATE_CURRENT_BARCODE", value: "STAN-123" });
          machine.send({ type: "SUBMIT_BARCODE" });
        });
      }
    );

    context("when the barcode is not in the table", () => {
      context("when the barcode is empty", () => {
        it("assigns an error message", (done) => {
          const machine = interpret(labwareMachine).onTransition((state) => {
            if (state.matches("idle.error")) {
              expect(state.context.errorMessage).to.eq("Barcode is required");
              done();
            }
          });
          machine.start();
          machine.send({ type: "SUBMIT_BARCODE" });
        });
      });

      context("when barcode is valid", () => {
        it("will look up the labware via a service", (done) => {
          const mockLTMachine = labwareMachine.withConfig({
            services: {
              findLabwareByBarcode: (ctx: LabwareMachineContext) => {
                return new Promise<FindLabwareQuery["labware"]>((resolve) => {
                  resolve({
                    labwareType: {
                      name: "Proviasette",
                    },
                    barcode: "STAN-123",
                    slots: [
                      {
                        block: true,
                        address: {
                          row: 1,
                          column: 1,
                        },
                        samples: [
                          {
                            section: 1,
                            tissue: {
                              replicate: 5,
                              donor: {
                                donorName: "Donor 3",
                              },
                              spatialLocation: {
                                code: 3,
                                tissueType: {
                                  name: "Lung",
                                },
                              },
                            },
                          },
                        ],
                      },
                    ],
                  });
                });
              },
            },
          });
          const machine = interpret(mockLTMachine).onTransition((state) => {
            if (
              state.matches("idle.normal") &&
              state.context.labwares.length > 0
            ) {
              expect(state.context.labwares.length).to.eq(1);
              done();
            }
          });
          machine.start();
          machine.send({ type: "UPDATE_CURRENT_BARCODE", value: "STAN-123" });
          machine.send({ type: "SUBMIT_BARCODE" });
        });
      });

      context("when barcode can't be found", () => {
        it("assigns an error message", (done) => {
          const mockLTMachine = labwareMachine.withConfig({
            services: {
              findLabwareByBarcode: (_ctx: LabwareMachineContext) => {
                return new Promise<FindLabwareQuery["labware"]>(
                  (_resolve, reject) => {
                    reject({
                      message:
                        "Exception while fetching data (/labware) : No labware found with barcode: STAN-321",
                    });
                  }
                );
              },
            },
          });

          const machine = interpret(mockLTMachine).onTransition((state) => {
            if (state.matches("idle.error")) {
              expect(state.context.errorMessage).to.eq(
                "No labware found with barcode: STAN-321"
              );
              done();
            }
          });
          machine.start();
          machine.send({ type: "UPDATE_CURRENT_BARCODE", value: "STAN-321" });
          machine.send({ type: "SUBMIT_BARCODE" });
        });
      });
    });
  });

  describe("REMOVE_LABWARE", () => {
    it("transitions to idle.success", (done) => {
      const mockLabwareTableMachine = labwareMachine.withContext(
        Object.assign({}, labwareMachine.context, {
          labwares: [
            {
              barcode: "STAN-123",
            },
          ],
        })
      );

      const machine = interpret(mockLabwareTableMachine).onTransition(
        (state) => {
          if (state.matches("idle.success")) {
            expect(state.context.successMessage).to.eq('"STAN-123" removed');
            expect(state.context.labwares.length).to.eq(0);
            done();
          }
        }
      );
      machine.start();
      machine.send({ type: "REMOVE_LABWARE", value: "STAN-123" });
    });
  });
});
