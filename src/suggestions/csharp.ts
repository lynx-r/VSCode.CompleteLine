import Suggestion from "../types/Suggestion";

const languages = ["csharp"];

const csharpSuggestions: Suggestion[] = [
  // if (...) [csharp]
  {
    label: "if (@1 == null)...",
    snippet: "if (@1 == null) {\n\t$0\n}",
    languages,
    when: (c) => c.previousLineText.match("^var\\s+(\\w+)\\s*=.*"),
  },
  {
    label: "if (@1 == null)...",
    snippet: "if (@1 == null) {\n\t$0\n}",
    languages,
    when: (c) => c.previousLineText.match("^(\\w+)\\s*=.*"),
  },
  // foreach (...) [csharp]
  {
    label: "foreach (var index in @1)...",
    snippet: "foreach (var ${1:index} in @1) {\n\t$0\n}",
    languages,
    when: (c) => c.previousLineText.match("^var\\s+(\\w+)\\s*=.*"),
  },
  {
    label: "foreach (var index in @1)...",
    snippet: "foreach (var ${1:index} in @1) {\n\t$0\n}",
    languages,
    when: (c) => c.previousLineText.match("^(\\w+)\\s*=.*"),
  },
];

export default csharpSuggestions;
