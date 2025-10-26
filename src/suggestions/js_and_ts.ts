import Suggestion from "../types/Suggestion";

export const JS_AND_TS_LANGAUAGES = [
  "javascript",
  "javascriptreact",
  "typescript",
  "typescriptreact",
  "vue",
];

const jsAndTsSuggestions: Suggestion[] = [
  // if (...)
  {
    label: "if (@1)...",
    snippet: "if (@1) {\n\t$0\n}",
    languages: JS_AND_TS_LANGAUAGES,
    when: (c) => c.previousLineText.match("^let\\s+(\\w+)\\s*=.*"),
  },
  {
    label: "if (@1)...",
    snippet: "if (@1) {\n\t$0\n}",
    languages: JS_AND_TS_LANGAUAGES,
    when: (c) => c.previousLineText.match("^const\\s+(\\w+)\\s*=.*"),
  },
  {
    label: "if (@1)...",
    snippet: "if (@1) {\n\t$0\n}",
    languages: JS_AND_TS_LANGAUAGES,
    when: (c) => c.previousLineText.match("^(\\w+)\\s*=.*"),
  },
  // for (...) [javascript, typescript]
  {
    label: "for (let index of @1)...",
    snippet: "for (let ${1:index} of @1) {\n\t$0\n}",
    languages: JS_AND_TS_LANGAUAGES,
    when: (c) => c.previousLineText.match("^let\\s+(\\w+)\\s*=.*"),
  },
  {
    label: "for (let index of @1)...",
    snippet: "for (let ${1:index} of @1) {\n\t$0\n}",
    languages: JS_AND_TS_LANGAUAGES,
    when: (c) => c.previousLineText.match("^const\\s+(\\w+)\\s*=.*"),
  },
  {
    label: "for (let index of @1)...",
    snippet: "for (let ${1:index} of @1) {\n\t$0\n}",
    languages: JS_AND_TS_LANGAUAGES,
    when: (c) => c.previousLineText.match("^(\\w+)\\s*=.*"),
  },
];

export default jsAndTsSuggestions;
