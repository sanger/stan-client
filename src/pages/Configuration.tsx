import React, { useContext } from "react";
import AppShell from "../components/AppShell";
import { GetConfigurationQuery, UserRole } from "../types/sdk";
import EntityManager from "../components/entityManager/EntityManager";
import Heading from "../components/Heading";
import { groupBy } from "lodash";
import StyledLink from "../components/StyledLink";
import { StanCoreContext } from "../lib/sdk";
import { TabList } from "../components/TabbedPane";
import { Item } from "@react-stately/collections";
import MutedText from "../components/MutedText";

type ConfigurationParams = {
  configuration: GetConfigurationQuery;
};

export default function Configuration({ configuration }: ConfigurationParams) {
  const stanCore = useContext(StanCoreContext);
  const groupedComments = groupBy(configuration.comments, "category");
  const groupedEquipments = groupBy(configuration.equipments, "category");

  //Listed in alphabetical order
  const configElements = [
    "Comments",
    "Cost Codes",
    "Destruction Reasons",
    "Equipments",
    "Fixatives",
    "HuMFre Numbers",
    "Projects",
    "Release Destinations",
    "Release Recipients",
    "Species",
    "Solutions",
    "Users",
    "Work Types",
  ];

  //Fill in the Config panels in same order as config Elements
  const configPanels = React.useMemo(() => {
    return [
      /**Comments**/
      <div className="space-y-8">
        {Object.keys(groupedComments).map((category) => (
          <div key={category} data-testid="config" className="space-y-3">
            <Heading level={2}>Comments - {category}</Heading>
            <EntityManager
              initialEntities={groupedComments[category]}
              displayKeyColumnName={"text"}
              valueColumnName={"enabled"}
              onChangeValue={(entity, value) => {
                const enabled = typeof value === "boolean" ? value : false;
                return stanCore
                  .SetCommentEnabled({ commentId: entity.id, enabled })
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
          </div>
        ))}
      </div>,

      /**Cost Codes**/
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
      </div>,

      /**Destruction Reasons**/
      <div data-testid="config">
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
              .SetDestructionReasonEnabled({
                text: entity.text,
                enabled,
              })
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
      </div>,

      /**Equipments**/
      <div className="space-y-8">
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
      </div>,

      /**Fixatives**/
      <div data-testid="config">
        <Heading level={2}>Fixatives</Heading>
        <p className="mt-3 mb-6 text-lg">
          Fixatives are available on the{" "}
          <StyledLink to={"/admin/registration"}>Block Registration</StyledLink>{" "}
          ,{" "}
          <StyledLink to={"/admin/slide_registration"}>
            Slide Registration
          </StyledLink>{" "}
          and{" "}
          <StyledLink to={"/admin/tissue_registration"}>
            Tissue Sample Registration
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
      </div>,

      /**HumFre Numbers**/
      <div data-testid="config">
        <Heading level={2}>HuMFre Numbers</Heading>
        <p className="mt-3 mb-6 text-lg">
          HuMFre Numbers are available on the{" "}
          <StyledLink to={"/admin/registration"}>Block Registration</StyledLink>{" "}
          ,{" "}
          <StyledLink to={"/admin/slide_registration"}>
            Slide Registration
          </StyledLink>{" "}
          and{" "}
          <StyledLink to={"/admin/tissue_registration"}>
            Tissue Sample Registration
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
      </div>,

      /**Projects**/
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
      </div>,

      /**Release Destinations**/
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
      </div>,

      /**Release Recipients**/
      <div data-testid="config">
        <Heading level={2}>Release Recipients</Heading>
        <p className="mt-3 mb-6 text-lg">
          Release Recipients are available on the{" "}
          <StyledLink to={"/admin/release"}>Release</StyledLink> page.
          They are also available on the{" "}
          <StyledLink to={"/sgp"}>SGP Management</StyledLink> page as "Work Requester"
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
      </div>,

      /**Species**/
      <div data-testid="config">
        <Heading level={2}>Species</Heading>
        <p className="mt-3 mb-6 text-lg">
          Species are available on the{" "}
          <StyledLink to={"/admin/registration"}>Block Registration</StyledLink>{" "}
          ,{" "}
          <StyledLink to={"/admin/slide_registration"}>
            Slide Registration
          </StyledLink>{" "}
          and{" "}
          <StyledLink to={"/admin/tissue_registration"}>
            Tissue Sample Registration
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
      </div>,
      /**Solutions**/
      <div data-testid="config">
        <Heading level={2}>Solutions</Heading>
        <p className="mt-3 mb-6 text-lg">
          Solutions are available on the{" "}
          <StyledLink to={"/admin/tissue_registration"}>
            Original Sample Registration
          </StyledLink>{" "}
          page.
        </p>
        <EntityManager
          initialEntities={configuration.solutions}
          displayKeyColumnName={"name"}
          valueColumnName={"enabled"}
          onChangeValue={(entity, value) => {
            const enabled = typeof value === "boolean" ? value : false;
            return stanCore
              .SetSolutionEnabled({
                name: entity.name,
                enabled,
              })
              .then((res) => res.setSolutionEnabled);
          }}
          onCreate={(name) =>
            stanCore.AddSolution({ name }).then((res) => res.addSolution)
          }
          valueFieldComponentInfo={{
            type: "CHECKBOX",
          }}
        />
      </div>,
      /**Users**/
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
              typeof value === "string" ? (value as UserRole) : UserRole.Normal;
            return stanCore
              .SetUserRole({ username: entity.username, role })
              .then((res) => res.setUserRole);
          }}
        />
      </div>,

      /**Work Types**/
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
      </div>,
    ];
  }, [groupedComments, configuration, groupedEquipments, stanCore]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>STAN Configuration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <MutedText className="mt-5">
            Press left/right arrows in keyboard to navigate to tabs that are not
            in display.
          </MutedText>
          {configPanels.length === configElements.length && (
            <TabList>
              {configElements.map((title, indx) => (
                <Item key={title} title={title}>
                  <div className={"mt-4"}>{configPanels[indx]}</div>
                </Item>
              ))}
            </TabList>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}