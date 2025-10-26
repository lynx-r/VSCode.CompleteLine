import * as vscode from "vscode";

export default interface Suggestion {
  label: string;
  snippet: string;
  languages?: string[];
  when: (c: SuggestionContext) => boolean | RegExpMatchArray | null;
}

export interface SuggestionContext {
  previousLineText: string;
  previousLineKeyword: string;
  parentLineKeyword: string;
  parentLineText: string;
  isWithinLoop: boolean;
  previousLine: Line | undefined;
  parentLines: Line[];
  nextLine: Line | undefined;
}

export enum AdjacentLine {
  Previous = -1,
  Next = 1,
}

export class Line {
  private static keywordRegExp = new RegExp("^\\w+");

  public keyword: string = "";

  constructor(public line: vscode.TextLine) {
    const result = Line.keywordRegExp.exec(line.text.trim());
    this.keyword = result ? result[0] : "";
  }
}
