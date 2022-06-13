import React, { useContext } from "react";
import AppShell from "../components/AppShell";
import { GetConfigurationQuery } from "../types/sdk";
import EntityManager from "../components/entityManager/EntityManager";
import Heading from "../components/Heading";
import { groupBy } from "lodash";
import { StanCoreContext } from "../lib/sdk";
import { TabList } from "../components/TabbedPane";
import { Item } from "@react-stately/collections";
type ConfigurationParams = {
  configuration: GetConfigurationQuery;
};

export default function Configuration({ configuration }: ConfigurationParams) {
  const stanCore = useContext(StanCoreContext);
  const groupedComments = groupBy(configuration.comments, "category");
  const groupedEquipments = groupBy(configuration.equipments, "category");

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>STAN Configuration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="space-y-8">
            <TabList>
              {Object.keys(groupedComments).map((category) => (
                <Item key={category} title={`Comments - ${category}`}>
                  <>
                    <Heading level={2}>Comments - {category}</Heading>
                    <EntityManager
                      initialEntities={groupedComments[category]}
                      displayKeyColumnName={"text"}
                      valueColumnName={"enabled"}
                      onChangeValue={(entity, value) => {
                        const enabled =
                          typeof value === "boolean" ? value : false;
                        return stanCore
                          .SetCommentEnabled({
                            commentId: entity.id,
                            enabled,
                          })
                          .then((res) => res.setCommentEnabled);
                      }}
                      onCreate={(text) =>
                        stanCore
                          .AddComment({ category, text })
                          .then((res) => res.addComment)
                      }
                      valueFieldComponentInfo={{
                        type: "CHECKBOX",
                      }}
                    />
                  </>
                </Item>
              ))}
            </TabList>

            {/*   f<div data-testid="config">
              <Heading level={2}>Destruction Reasons</Heading>
              <p className="mt-3 mb-6 text-lg">
                Destruction Reasons are used on the{" "}
                <StyledLink to={"/admin/destroy"}>Destroy</StyledLink> page.
              </p>
              <EntityManager
                initialEntities={configuration.destructionReasons}
                displayKeyColumnName={"text"}
                valueColumnName={"enabled"}
                onChangeValue={(entity, value) => {
                  const enabled = typeof value === "boolean" ? value : false;
                  return stanCore
                    .SetDestructionReasonEnabled({ text: entity.text, enabled })
                    .then((res) => res.setDestructionReasonEnabled);
                }}
                onCreate={(text) =>
                  stanCore
                    .AddDestructionReason({ text })
                    .then((res) => res.addDestructionReason)
                }
                valueFieldComponentInfo={{
                  type: "CHECKBOX",
                }}
              />
            </div>

            <div data-testid="config">
              <Heading level={2}>Species</Heading>
              <p className="mt-3 mb-6 text-lg">
                Species are available on the{" "}
                <StyledLink to={"/admin/registration"}>
                  Block Registration
                </StyledLink>{" "}
                and{" "}
                <StyledLink to={"/admin/slide_registration"}>
                  Slide Registration
                </StyledLink>{" "}
                pages.
              </p>
              <EntityManager
                initialEntities={configuration.species}
                displayKeyColumnName={"name"}
                valueColumnName={"enabled"}
                onChangeValue={(entity, value) => {
                  const enabled = typeof value === "boolean" ? value : false;
                  return stanCore
                    .SetSpeciesEnabled({ enabled, name: entity.name })
                    .then((res) => res.setSpeciesEnabled);
                }}
                onCreate={(name) =>
                  stanCore.AddSpecies({ name }).then((res) => res.addSpecies)
                }
                valueFieldComponentInfo={{
                  type: "CHECKBOX",
                }}
              />
            </div>

            <div data-testid="config">
              <Heading level={2}>Fixatives</Heading>
              <p className="mt-3 mb-6 text-lg">
                Fixatives are available on the{" "}
                <StyledLink to={"/admin/registration"}>
                  Block Registration
                </StyledLink>{" "}
                and{" "}
                <StyledLink to={"/admin/slide_registration"}>
                  Slide Registration
                </StyledLink>{" "}
                pages.
              </p>
              <EntityManager
                initialEntities={configuration.fixatives}
                displayKeyColumnName={"name"}
                valueColumnName={"enabled"}
                onChangeValue={(entity, value) => {
                  const enabled = typeof value === "boolean" ? value : false;
                  return stanCore
                    .SetFixativeEnabled({ enabled, name: entity.name })
                    .then((res) => res.setFixativeEnabled);
                }}
                onCreate={(name) =>
                  stanCore.AddFixative({ name }).then((res) => res.addFixative)
                }
                valueFieldComponentInfo={{
                  type: "CHECKBOX",
                }}
              />
            </div>

            <div data-testid="config">
              <Heading level={2}>HuMFre Numbers</Heading>
              <p className="mt-3 mb-6 text-lg">
                HuMFre Numbers are available on the{" "}
                <StyledLink to={"/admin/registration"}>
                  Block Registration
                </StyledLink>{" "}
                and{" "}
                <StyledLink to={"/admin/slide_registration"}>
                  Slide Registration
                </StyledLink>{" "}
                pages.
              </p>
              <EntityManager
                initialEntities={configuration.hmdmcs}
                displayKeyColumnName={"hmdmc"}
                alternateKeyColumnName={"HuMFre"}
                valueColumnName={"enabled"}
                onChangeValue={(entity, value) => {
                  const enabled = typeof value === "boolean" ? value : false;
                  return stanCore
                    .SetHmdmcEnabled({ enabled, hmdmc: entity.hmdmc })
                    .then((res) => res.setHmdmcEnabled);
                }}
                onCreate={(hmdmc) =>
                  stanCore.AddHmdmc({ hmdmc }).then((res) => res.addHmdmc)
                }
                valueFieldComponentInfo={{
                  type: "CHECKBOX",
                }}
              />
            </div>

            <div data-testid="config">
              <Heading level={2}>Release Destinations</Heading>
              <p className="mt-3 mb-6 text-lg">
                Release Destinations are available on the{" "}
                <StyledLink to={"/admin/release"}>Release</StyledLink> page.
              </p>
              <EntityManager
                initialEntities={configuration.releaseDestinations}
                displayKeyColumnName={"name"}
                valueColumnName={"enabled"}
                onChangeValue={(entity, value) => {
                  const enabled = typeof value === "boolean" ? value : false;
                  return stanCore
                    .SetReleaseDestinationEnabled({
                      enabled,
                      name: entity.name,
                    })
                    .then((res) => res.setReleaseDestinationEnabled);
                }}
                onCreate={(name) =>
                  stanCore
                    .AddReleaseDestination({ name })
                    .then((res) => res.addReleaseDestination)
                }
                valueFieldComponentInfo={{
                  type: "CHECKBOX",
                }}
              />
            </div>

            <div data-testid="config">
              <Heading level={2}>Release Recipients</Heading>
              <p className="mt-3 mb-6 text-lg">
                Release Recipients are available on the{" "}
                <StyledLink to={"/admin/release"}>Release</StyledLink> page.
              </p>
              <EntityManager
                initialEntities={configuration.releaseRecipients}
                displayKeyColumnName={"username"}
                valueColumnName={"enabled"}
                onChangeValue={(entity, value) => {
                  const enabled = typeof value === "boolean" ? value : false;
                  return stanCore
                    .SetReleaseRecipientEnabled({
                      enabled,
                      username: entity.username,
                    })
                    .then((res) => res.setReleaseRecipientEnabled);
                }}
                onCreate={(username) =>
                  stanCore
                    .AddReleaseRecipient({ username })
                    .then((res) => res.addReleaseRecipient)
                }
                valueFieldComponentInfo={{
                  type: "CHECKBOX",
                }}
              />
            </div>

            <div data-testid="config">
              <Heading level={2}>Work Types</Heading>
              <p className="mt-3 mb-6 text-lg" />
              <EntityManager
                initialEntities={configuration.workTypes}
                displayKeyColumnName={"name"}
                valueColumnName={"enabled"}
                onChangeValue={(entity, value) => {
                  const enabled = typeof value === "boolean" ? value : false;
                  return stanCore
                    .SetWorkTypeEnabled({
                      enabled,
                      name: entity.name,
                    })
                    .then((res) => res.setWorkTypeEnabled);
                }}
                onCreate={(name) =>
                  stanCore.AddWorkType({ name }).then((res) => res.addWorkType)
                }
                valueFieldComponentInfo={{
                  type: "CHECKBOX",
                }}
              />
            </div>

            <div data-testid="config">
              <Heading level={2}>Projects</Heading>
              <p className="mt-3 mb-6 text-lg" />
              <EntityManager
                initialEntities={configuration.projects}
                displayKeyColumnName={"name"}
                valueColumnName={"enabled"}
                onChangeValue={(entity, value) => {
                  const enabled = typeof value === "boolean" ? value : false;
                  return stanCore
                    .SetProjectEnabled({
                      enabled,
                      name: entity.name,
                    })
                    .then((res) => res.setProjectEnabled);
                }}
                onCreate={(name) =>
                  stanCore.AddProject({ name }).then((res) => res.addProject)
                }
                valueFieldComponentInfo={{
                  type: "CHECKBOX",
                }}
              />
            </div>

            <div data-testid="config">
              <Heading level={2}>Cost Codes</Heading>
              <p className="mt-3 mb-6 text-lg" />
              <EntityManager
                initialEntities={configuration.costCodes}
                displayKeyColumnName={"code"}
                valueColumnName={"enabled"}
                onChangeValue={(entity, value) => {
                  const enabled = typeof value === "boolean" ? value : false;
                  return stanCore
                    .SetCostCodeEnabled({
                      enabled,
                      code: entity.code,
                    })
                    .then((res) => res.setCostCodeEnabled);
                }}
                valueFieldComponentInfo={{
                  type: "CHECKBOX",
                }}
                onCreate={(code) =>
                  stanCore.AddCostCode({ code }).then((res) => res.addCostCode)
                }
              />
            </div>

            {Object.keys(groupedEquipments).map((category) => (
              <div key={category} data-testid="config" className="space-y-3">
                <Heading level={2}>Equipment - {category}</Heading>
                <EntityManager
                  initialEntities={groupedEquipments[category]}
                  displayKeyColumnName={"name"}
                  valueColumnName={"enabled"}
                  onChangeValue={(entity, value) => {
                    const enabled = typeof value === "boolean" ? value : false;
                    return stanCore
                      .SetEquipmentEnabled({
                        equipmentId: entity.id,
                        enabled,
                      })
                      .then((res) => res.setEquipmentEnabled);
                  }}
                  onCreate={(name) =>
                    stanCore
                      .AddEquipment({ category, name })
                      .then((res) => res.addEquipment)
                  }
                  valueFieldComponentInfo={{
                    type: "CHECKBOX",
                  }}
                />
              </div>
            ))}
            <div data-testid="config">
              <Heading level={2}>Users</Heading>
              <EntityManager
                initialEntities={configuration.users}
                displayKeyColumnName={"username"}
                valueColumnName={"role"}
                valueFieldComponentInfo={{
                  type: "SELECT",
                  valueOptions: Object.values(UserRole),
                }}
                onCreate={(username) =>
                  stanCore.AddUser({ username }).then((res) => res.addUser)
                }
                onChangeValue={(entity, value) => {
                  const role: UserRole =
                    typeof value === "string"
                      ? (value as UserRole)
                      : UserRole.Normal;
                  return stanCore
                    .SetUserRole({ username: entity.username, role })
                    .then((res) => res.setUserRole);
                }}
              />
            </div> */}
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
