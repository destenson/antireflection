
import * as ts from 'typescript';

import {assert} from 'chai';

import {createCompiler} from '../dist/ts-test-host';

suite('A', function() {

    const tsconfig = {
        "extends": "../../tsconfig.base.json",
        "files": [
            "../../node_modules/typescript/lib/lib.es5.d.ts",
            "../../node_modules/typescript/lib/lib.es2015.core.d.ts"
        ]
    };


    test('a', function() {
        const compiler = createCompiler({tsconfig});

        const out1: {[name: string]: string} = {};

        const r1 = compiler.compile('let x = 3 + 2', (name, text) => {out1[name] = text});
        assert.deepEqual(r1.diagnostics, []);
        assert.deepEqual(out1, {
            '$.js': 'var x = 3 + 2;\n',
            '$.d.ts': 'declare let x: number;\n'
        });
        assert.lengthOf(r1.sourceFile!.statements, 1);
        assert.equal(r1.sourceFile!.statements[0].kind, ts.SyntaxKind.VariableStatement);
        const nn = r1.getSourceFileNames();
        nn.forEach(n => {
            if (n != '$.ts' && !n.endsWith('lib.es5.d.ts') && !n.endsWith('lib.es2015.core.d.ts')) {
                assert.isOk(false, `unexpected file in getSourceFileNames(): ${n}`);
            }
        });

        const r2 = compiler.compile('let x = z + 2');
        assert.equal(r2.diagnostics.length, 1);
        assert.equal(r2.formatDiagnostic(r2.diagnostics[0]), '<source>(1,9): Error TS2304: Cannot find name \'z\'.');

    });


    test('b', function() {
        const compiler = createCompiler({});
        const r = compiler.compile('let x = 3 + 2');
        const diagnosticTypes: {[t: string]: boolean} = {};
        let optionError: string | undefined = undefined;
        let globalError: string | undefined = undefined;
        r.diagnostics.forEach(d => {
            diagnosticTypes[d.diagnosticType] = true;
            if (d.diagnosticType === 'option' && optionError === undefined) {
                optionError = r.formatDiagnostic(d);
            }
            if (d.diagnosticType === 'global' && globalError === undefined) {
                globalError = r.formatDiagnostic(d);
            }
        });
        assert.deepEqual(diagnosticTypes, {option: true, global: true});
        assert.match(optionError, /^Error TS5012: Cannot read file/);
        assert.match(globalError, /^Error TS2318: Cannot find global type/);
    });

    test('c', function() {
        const compiler = createCompiler({defaultLibLocation: '../../node_modules/typescript/lib', tsconfig: {compilerOptions: {lib: ['es6']}}});
        const r = compiler.compile('let x = 3 + 2');
        assert.deepEqual(r.diagnostics, []);
    });

    test('d', function() {
        const compiler = createCompiler({defaultLibLocation: '../../node_modules/typescript/lib'});
        const r = compiler.compile('let x = 3 + 2');
        assert.deepEqual(r.diagnostics, []);
    });

    test('e', function() {
        const compiler = createCompiler({tsconfig: {compilerOptions: {lib:[]}}});
        const r = compiler.parse('let x = z + 2');
        assert.deepEqual(r.diagnostics, []);
        assert.lengthOf(r.sourceFile!.statements, 1);
        assert.equal(r.sourceFile!.statements[0].kind, ts.SyntaxKind.VariableStatement);
    });

});