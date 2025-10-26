import Suggestion from "../types/Suggestion";
import csharpSuggestions from "./csharp";
import jsAndTsSuggestions from "./js_and_ts";

const SUGGESTIONS: Array<Suggestion> = [
  ...jsAndTsSuggestions,
  ...csharpSuggestions,

  // more suggestions
  {
    label: "else...",
    snippet: "else {\n\t$0\n}",
    when: (c) => c.previousLineKeyword === "if",
  },
  {
    label: "else if...",
    snippet: "else if (${1:contition}) {\n\t$0\n}",
    when: (c) => c.previousLineKeyword === "if",
  },
  {
    label: "case...",
    snippet: "case ${1:condition}:\n\t$0\n\tbreak;",
    when: (c) =>
      c.parentLineKeyword === "switch" || c.previousLineKeyword === "case",
  },
  {
    label: "default...",
    snippet: "default:\n\t$0\n\tbreak;",
    when: (c) =>
      c.parentLineKeyword === "switch" || c.previousLineKeyword === "case",
  },
  {
    label: "catch...",
    snippet: "catch {\n\t$0\n}",
    when: (c) => c.previousLineKeyword === "try",
  },
  {
    label: "break",
    snippet: "break;",
    when: (c) => c.isWithinLoop && !c.nextLine,
  },
  {
    label: "continue",
    snippet: "continue;",
    when: (c) => c.isWithinLoop && !c.nextLine,
  },
  {
    label: "return",
    snippet: "return;",
    when: (c) => !c.nextLine,
  },
];

export default SUGGESTIONS;
