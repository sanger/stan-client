import { CommentFieldsFragment } from "../../types/sdk";
import { createSessionStorageRepository } from "./index";
import commentFactory from "../../lib/factories/commentFactory";

const seeds: Array<CommentFieldsFragment> = [
  commentFactory.build({ text: "Section Folded", category: "section" }),
  commentFactory.build({ text: "Poor section quality", category: "section" }),
  commentFactory.build({ text: "Sectioned well", category: "section" }),
  commentFactory.build({ text: "Section exploded", category: "section" }),
  commentFactory.build({ text: "This is good", category: "blah" }),
  commentFactory.build({ text: "Optimal", category: "analysis" }),
  commentFactory.build({ text: "Potential to work", category: "analysis" }),
  commentFactory.build({
    text: " Not recommended to proceed",
    category: "analysis",
  }),

  commentFactory.build({
    text: "This is bad",
    category: "blah",
    enabled: false,
  }),
  commentFactory.build({ text: "RIN number too low", category: "Work status" }),
  commentFactory.build({
    text: "Poor quality tissue",
    category: "Work status",
  }),
  commentFactory.build({
    text: "Waiting for reagents",
    category: "Work status",
  }),
  commentFactory.build({
    text: "Waiting for customer",
    category: "Work status",
  }),
  commentFactory.build({
    category: "result",
    text: "Slide damaged",
  }),
  commentFactory.build({
    category: "result",
    text: "Wrong morphology",
  }),
  commentFactory.build({
    category: "result",
    text: "Section invisible",
    enabled: false,
  }),
];

const commentRepository = createSessionStorageRepository(
  "COMMENTS",
  "text",
  seeds
);

export default commentRepository;
