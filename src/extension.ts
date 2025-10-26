"use strict";

import * as vscode from "vscode";
import completeLine from "./core";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.completeLine",
    completeLine,
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
