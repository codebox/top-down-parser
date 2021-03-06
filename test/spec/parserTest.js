"use strict";
describe("Parser", function() {
    let parser;

    describe("with simple grammar", function() {
        beforeEach(() => {
            parser = buildParser(`
                START -> EXPR
                EXPR  -> NUM | NUM OP EXPR
                NUM   -> 0 | 1 | 2 | 3 | 4
                OP    -> + | - | * | /
            `);
        });

        it("should parse single symbol", function () {
            const result = parser.parse('1');

            expect(result.remainder).toBe('');
            expect(result.tree).toEqual({
                'START' : [
                    {'EXPR' : [
                        {'NUM' : ['1']}
                    ]}
                ]
            });
        });

        it("should parse composite expression including whitespace", function () {
            const result = parser.parse('  1 +  2 ');

            expect(result.remainder).toBe('');
            expect(result.tree).toEqual(
                {'START' : [
                    {'EXPR' : [
                        {'NUM' : ['1']},
                        {'OP' : ['+']},
                        {'EXPR' : [
                            {'NUM' : ['2']},
                        ]}
                    ]}
                ]
            });
        });

        it("should correctly handle partially parseable text", function () {
            const result = parser.parse('1+2/3^4');

            expect(result.remainder).toBe('^4');
            expect(result.tree).toEqual(
                {'START' : [
                    {'EXPR' : [
                        {'NUM' : ['1']},
                        {'OP' : ['+']},
                        {'EXPR' : [
                            {'NUM' : ['2']},
                            {'OP' : ['/']},
                            {'EXPR' : [
                                {'NUM' : ['3']}
                            ]}
                        ]}
                    ]}
                ]
            });
        });
    });

    describe("with grammar containing duplicate symbols on LHS", function() {
        beforeEach(() => {
            parser = buildParser(`
                START -> EXPR
                EXPR  -> NUM
                EXPR  -> NUM OP EXPR
                NUM   -> 0 | 1 | 2 | 3 | 4
                OP    -> + | - | * | /
            `);
        });

        it("should parse composite expression including whitespace", function () {
            const result = parser.parse('  1 +  2 ');

            expect(result.remainder).toBe('');
            expect(result.tree).toEqual(
                {'START' : [
                    {'EXPR' : [
                        {'NUM' : ['1']},
                        {'OP' : ['+']},
                        {'EXPR' : [
                            {'NUM' : ['2']},
                        ]}
                    ]}
                ]
            });
        });
    });

    describe("with alternate start symbol and epsilon", function() {
        beforeEach(() => {
            parser = buildParser(`
                S       -> LETTERS
                LETTERS -> LETTER LETTERS | NOWT 
                LETTER  -> A | B | C
            `, 'S', 'NOWT');
        });

        it("should handle valid string", function () {
            const result = parser.parse('AA');
            expect(result.remainder).toBe('');

            expect(result.tree).toEqual({
                'S': [
                    {'LETTERS': [
                        {'LETTER' : ['A']},
                        {'LETTERS': [
                            {'LETTER' : ['A']},
                            {'LETTERS': ['NOWT']}
                        ]}
                    ]}
                ]
            });
        });
    });

    describe("with left-recursive grammar", function() {
        it("should throw an error", function () {
            expect(() => buildParser(`
                START -> ITEMS
                ITEMS -> ITEM | ITEMS ITEM
                ITEM  -> 'X
            `)).toThrow();
        });
    });

    describe("with alternative containing spaces", function() {
        it("should parse correctly", function () {
            const parser = buildParser(`
                START   -> PARTS
                PARTS   -> PART PARTS | ε 
                PART    -> A | B C | D
            `);

            const result = parser.parse('A B C D');
            expect(result.remainder).toBe('');

            expect(result.tree).toEqual({
                'START': [
                    {'PARTS': [
                        {'PART' : ['A']},
                        {'PARTS': [
                            {'PART' : ['B', 'C']},
                            {'PARTS': [
                                {'PART' : ['D']},
                                {'PARTS': ['ε']}
                            ]}
                        ]}
                    ]}
                ]
            });
        });
    });
});
