import * as vscode from "vscode";

export interface SnippetQuickPickItem extends vscode.QuickPickItem {
  snippet: vscode.SnippetString;
}
