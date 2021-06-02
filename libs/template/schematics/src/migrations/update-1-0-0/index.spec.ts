import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Template Migration 1.0.0', () => {
  const collectionPath = path.join(__dirname, '../../../migration.json');
  let appTree: UnitTestTree;

  it('should replace LetModule + LetDirective import specifier', async () => {
    appTree = await setupTestFile(`
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LetModule, LetDirective } from '@rx-angular/template';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    LetModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
  `);

    const file = appTree.readContent('app.module.ts');

    expect(file).not.toContain(
      "import { LetModule, LetDirective } from '@rx-angular/template'"
    );
    expect(file).toContain(
      "import { LetModule, LetDirective } from '@rx-angular/template/let'"
    );
  });

  it('should replace PushModule + PushPipe import specifier', async () => {
    appTree = await setupTestFile(`
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PushModule, PushPipe } from '@rx-angular/template';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    PushModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
  `);

    const file = appTree.readContent('app.module.ts');

    expect(file).not.toContain(
      "import { PushModule, PushPipe } from '@rx-angular/template'"
    );
    expect(file).toContain(
      "import { PushModule, PushPipe } from '@rx-angular/template/push'"
    );
  });

  it('should replace UnpatchModule + UnpatchDirective import specifier', async () => {
    appTree = await setupTestFile(`
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UnpatchModule, UnpatchDirective } from '@rx-angular/template';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    UnpatchModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
  `);

    const file = appTree.readContent('app.module.ts');

    expect(file).not.toContain(
      "import { UnpatchModule, UnpatchDirective } from '@rx-angular/template'"
    );
    expect(file).toContain(
      "import { UnpatchModule, UnpatchDirective } from '@rx-angular/template/unpatch'"
    );
  });

  function setupTestFile(fileInput: string, filePath = './app.module.ts') {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = new UnitTestTree(Tree.empty());

    tree.create(filePath, fileInput);

    return runner
      .runSchematicAsync(`template-migration-01`, {}, tree)
      .toPromise();
  }
});
