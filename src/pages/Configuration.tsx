import React, { useContext } from "react";
import AppShell from "../components/AppShell";
import { GetConfigurationQuery } from "../types/sdk";
import EntityManager from "../components/entityManager/EntityManager";
import Heading from "../components/Heading";
import { groupBy } from "lodash";
import StyledLink from "../components/StyledLink";
import { StanCoreContext } from "../lib/sdk";

type ConfigurationParams = {
  configuration: GetConfigurationQuery;
};

export default function Configuration({ configuration }: ConfigurationParams) {
  const stanCore = useContext(StanCoreContext);
  const groupedComments = groupBy(configuration.comments, "category");

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>STAN Configuration</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <div className="space-y-8">
            {Object.keys(groupedComments).map((category) => (
              <div key={category} data-testid="config" className="space-y-3">
                <Heading level={2}>Comments - {category}</Heading>
                <EntityManager
                  initialEntities={groupedComments[category]}
                  displayColumnName={"text"}
                  onToggle={(entity, enabled) => {
                    return stanCore
                      .SetCommentEnabled({ commentId: entity.id, enabled })
                      .then((res) => res.setCommentEnabled);
                  }}
                  onCreate={(text) =>
                    stanCore
                      .AddComment({ category, text })
                      .then((res) => res.addComment)
                  }
                />
              </div>
            ))}

            <div data-testid="config">
              <Heading level={2}>Destruction Reasons</Heading>
              <p className="mt-3 mb-6 text-lg">
                Destruction Reasons are used on the{" "}
                <StyledLink to={"/admin/destroy"}>Destroy</StyledLink> page.
              </p>
              <EntityManager
                initialEntities={configuration.destructionReasons}
                displayColumnName={"text"}
                onToggle={(entity, enabled) =>
                  stanCore
                    .SetDestructionReasonEnabled({ text: entity.text, enabled })
                    .then((res) => res.setDestructionReasonEnabled)
                }
                onCreate={(text) =>
                  stanCore
                    .AddDestructionReason({ text })
                    .then((res) => res.addDestructionReason)
                }
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
                displayColumnName={"name"}
                onToggle={(entity, enabled) =>
                  stanCore
                    .SetSpeciesEnabled({ enabled, name: entity.name })
                    .then((res) => res.setSpeciesEnabled)
                }
                onCreate={(name) =>
                  stanCore.AddSpecies({ name }).then((res) => res.addSpecies)
                }
              />
            </div>

            <div data-testid="config">
              <Heading level={2}>HMDMC Numbers</Heading>
              <p className="mt-3 mb-6 text-lg">
                HMDMC Numbers are available on the{" "}
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
                displayColumnName={"hmdmc"}
                onToggle={(entity, enabled) =>
                  stanCore
                    .SetHmdmcEnabled({ enabled, hmdmc: entity.hmdmc })
                    .then((res) => res.setHmdmcEnabled)
                }
                onCreate={(hmdmc) =>
                  stanCore.AddHmdmc({ hmdmc }).then((res) => res.addHmdmc)
                }
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
                displayColumnName={"name"}
                onToggle={(entity, enabled) =>
                  stanCore
                    .SetReleaseDestinationEnabled({
                      enabled,
                      name: entity.name,
                    })
                    .then((res) => res.setReleaseDestinationEnabled)
                }
                onCreate={(name) =>
                  stanCore
                    .AddReleaseDestination({ name })
                    .then((res) => res.addReleaseDestination)
                }
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
                displayColumnName={"username"}
                onToggle={(entity, enabled) =>
                  stanCore
                    .SetReleaseRecipientEnabled({
                      enabled,
                      username: entity.username,
                    })
                    .then((res) => res.setReleaseRecipientEnabled)
                }
                onCreate={(username) =>
                  stanCore
                    .AddReleaseRecipient({ username })
                    .then((res) => res.addReleaseRecipient)
                }
              />
            </div>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
