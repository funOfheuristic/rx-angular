import { Rule, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';

import { commitChanges, createReplaceChange } from '../../common/utils/changes';
import { visitTSSourceFiles } from '../../common/utils/visitors';

const renames: Record<string, string> = {
  LetModule: '@rx-angular/template/let',
  LetDirective: '@rx-angular/template/let',
  PushModule: '@rx-angular/template/push',
  PushPipe: '@rx-angular/template/push',
  UnpatchDirective: '@rx-angular/template/unpatch',
  UnpatchModule: '@rx-angular/template/unpatch',
};

export default function (): Rule {
  return (tree: Tree) => {
    visitTSSourceFiles(tree, (sourceFile, tree) => {
      const imports = sourceFile.statements
        .filter(ts.isImportDeclaration)
        .filter(
          ({ moduleSpecifier }) =>
            moduleSpecifier.getText(sourceFile) === `'@rx-angular/template'` ||
            moduleSpecifier.getText(sourceFile) === `"@rx-angular/template"`
        );

      if (imports.length === 0) {
        return;
      }

      const changes = updateTemplateImportSpecifiers(sourceFile, imports);
      commitChanges(tree, sourceFile.fileName, changes);
    });
  };
}

function updateTemplateImportSpecifiers(
  sourceFile: ts.SourceFile,
  imports: ts.ImportDeclaration[]
) {
  return imports
    .map((importDeclaration) => {
      const importSpecifierValue = (importDeclaration.importClause!
        .namedBindings as ts.NamedImports).elements.map((importSpecifier) =>
        importSpecifier.getText()
      )[0];

      return {
        moduleSpecifier: importDeclaration.moduleSpecifier,
        oldText: importDeclaration.moduleSpecifier.getText(),
        text: `'${renames[importSpecifierValue]}'`,
      };
    })
    .map(({ moduleSpecifier, oldText, text }) =>
      createReplaceChange(sourceFile, moduleSpecifier, oldText, text)
    );
}
