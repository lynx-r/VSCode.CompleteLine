import * as vscode from "vscode";
import {
  BLOCK_KEYWORDS,
  LOOP_KEYWORDS,
  SUPPORTED_LANGUAGES,
} from "./constants";
import SUGGESTIONS from "./suggestions";
import { SnippetQuickPickItem } from "./types/SnippetQuickPickItem";
import { AdjacentLine, SuggestionContext } from "./types/Suggestion";

export default function completeLine(): void {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  if (!SUPPORTED_LANGUAGES.includes(editor.document.languageId)) {
    return;
  }

  let line = editor.document.lineAt(editor.selection.active.line);
  if (!line) {
    return;
  }

  if (line.isEmptyOrWhitespace) {
    completeBlankLine(editor);
  } else {
    completePartialLine(editor);
  }
}

function completeBlankLine(editor: vscode.TextEditor): void {
  const document = editor.document;
  const activeLine = editor.selection.active.line;
  const language = document.languageId;

  const previousLine = getAdjacentLine(
    document,
    activeLine,
    AdjacentLine.Previous,
  );
  const nextLine = getAdjacentLine(document, activeLine, AdjacentLine.Next);
  const parentLines = getParentLines(document, activeLine);

  const context: SuggestionContext = {
    previousLineKeyword: previousLine ? previousLine.keyword : "",
    previousLineText: previousLine ? previousLine.line.text.trim() : "",
    parentLineKeyword: parentLines.length > 0 ? parentLines[0].keyword : "",
    parentLineText:
      parentLines.length > 0 ? parentLines[0].line.text.trim() : "",
    isWithinLoop: isWithinLoop(parentLines),
    previousLine: previousLine,
    parentLines: parentLines,
    nextLine: nextLine,
  };

  const items = new Array<SnippetQuickPickItem>();

  for (let suggestion of SUGGESTIONS) {
    if (suggestion.languages && suggestion.languages.indexOf(language) < 0) {
      continue;
    }

    const result = suggestion.when(context);
    if (!result) {
      continue;
    }

    let label = suggestion.label;
    let snippet = suggestion.snippet;

    // if regex matches, replace parameters (@1, @2, ...) with values from the regex
    if (Array.isArray(result)) {
      for (let i = 1; i < result.length; i++) {
        const parameter = result[i];
        label = label.replace("@" + i, parameter);
        snippet = snippet.replace("@" + i, parameter);
      }
    }

    if (document.eol === vscode.EndOfLine.CRLF) {
      snippet = snippet.replace("\n", "\r\n");
    }

    items.push({ label, snippet: new vscode.SnippetString(snippet) });
  }

  // todo: add standard snippets to list

  // if nothing is available, show standard snippets
  if (items.length === 0) {
    vscode.commands.executeCommand("editor.action.insertSnippet");
    return;
  }

  vscode.window
    .showQuickPick<SnippetQuickPickItem>(items, { placeHolder: "Suggestions" })
    .then((selectedItem) => {
      if (selectedItem) {
        editor.insertSnippet(selectedItem.snippet);
      }
    });
}

function completePartialLine(editor: vscode.TextEditor): void {
  const document = editor.document;
  const activeLine = editor.selection.active.line;

  const line = document.lineAt(activeLine);
  const trimmedLineText = line ? line.text.trim() : "";

  let nextTrimmedLineText = "";
  if (activeLine < document.lineCount - 1) {
    const nextLine = document.lineAt(activeLine + 1);
    nextTrimmedLineText = nextLine ? nextLine.text.trim() : "";
  }

  let snippet = "";
  const isKeyWord = BLOCK_KEYWORDS.some((keyword) =>
    trimmedLineText.includes(keyword),
  );
  const isNotBlock = !(
    trimmedLineText.endsWith("{") || nextTrimmedLineText.startsWith("{")
  );
  const isMethod =
    /^(static\s+)?(async\s+)?((\w+\s*\(.*\))|((function\s+)\w+\s*\(.*\))|((get|set)\s*\(.*\)))/.test(
      trimmedLineText,
    );
  if (isMethod || (isKeyWord && isNotBlock)) {
    snippet = getClosingParentheses(line) + " {\n\t$0\n}";
  } else if (trimmedLineText.endsWith("{")) {
    snippet = "\n\t$0\n}";
  } else if (trimmedLineText.endsWith("=>")) {
    snippet = " {\n\t$0\n}";
  } else if (!trimmedLineText.endsWith(";")) {
    snippet = getClosingParentheses(line) + ";\n";
  } else {
    snippet = "\n";
  }

  if (snippet === "") {
    return;
  }

  if (document.eol === vscode.EndOfLine.CRLF) {
    snippet = snippet.replace("\n", "\r\n");
  }

  editor.insertSnippet(new vscode.SnippetString(snippet), line.range.end);
}

function getClosingParentheses(line: vscode.TextLine): string {
  const trimmedLineText = line.text.trim();
  let openParentheses = 0;

  for (let i = 0; i < trimmedLineText.length; i++) {
    switch (trimmedLineText.charAt(i)) {
      case "(":
        openParentheses++;
        break;
      case ")":
        openParentheses--;
        break;
    }
  }

  return openParentheses > 0 ? ")".repeat(openParentheses) : "";
}

function getLineLevel(line: vscode.TextLine): number {
  return line.firstNonWhitespaceCharacterIndex;
}

function getAdjacentLine(
  document: vscode.TextDocument,
  activeLine: number,
  direction: AdjacentLine,
): Line | undefined {
  const activeLineLevel = getLineLevel(document.lineAt(activeLine));

  for (
    let lineNumber = activeLine + direction;
    lineNumber >= 0 && lineNumber < document.lineCount;
    lineNumber += direction
  ) {
    const line = document.lineAt(lineNumber);
    if (!isStatement(line)) {
      continue;
    }

    const lineLevel = getLineLevel(line);
    if (lineLevel === activeLineLevel) {
      return new Line(line);
    }

    if (lineLevel < activeLineLevel) {
      return undefined;
    }
  }

  return undefined;
}

function getParentLines(
  document: vscode.TextDocument,
  activeLine: number,
): Line[] {
  let lines = new Array<Line>();
  let activeLineLevel = getLineLevel(document.lineAt(activeLine));

  for (let lineNumber = activeLine - 1; lineNumber >= 0; lineNumber--) {
    const line = document.lineAt(lineNumber);
    if (!isStatement(line)) {
      continue;
    }

    let lineLevel = getLineLevel(line);
    if (lineLevel < activeLineLevel) {
      lines.push(new Line(line));
      activeLineLevel = lineLevel;
    }
  }

  return lines;
}

function isStatement(line: vscode.TextLine): boolean {
  // empty line
  if (line.isEmptyOrWhitespace) {
    return false;
  }

  const trimmedLineText = line.text.trim();

  // comments
  // todo: support for block comments
  if (
    trimmedLineText.startsWith("//") ||
    trimmedLineText.startsWith("/*") ||
    trimmedLineText.startsWith("*/") ||
    trimmedLineText.startsWith("*")
  ) {
    return false;
  }

  // curly braces
  if (trimmedLineText === "{" || trimmedLineText === "}") {
    return false;
  }

  return true;
}

function isWithinLoop(parentLines: Line[]): boolean {
  return parentLines.some((line) => LOOP_KEYWORDS.indexOf(line.keyword) >= 0);
}

class Line {
  private static keywordRegExp = new RegExp("^\\w+");

  public keyword: string = "";

  constructor(public line: vscode.TextLine) {
    const result = Line.keywordRegExp.exec(line.text.trim());
    this.keyword = result ? result[0] : "";
  }
}
