---
inject: true
to: src/lib/factories/presentationModelFactory.ts
append: true
---

export function build<%= Name %>PresentationModel(
  current: <%= Name %>State,
  service: <%= Name %>MachineService
): <%= Name %>PresentationModel {
  return new <%= Name %>PresentationModel(current, service);
}