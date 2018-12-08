# Top-Down Parser

A simple top-down parser written in JavaScript. Every so often I need to write a parser, and keep forgetting how the recursion works.
 This is a simple- and general-as-possible implementation that I can refer back to in the future.
 
To use the parser, call the `buildParser()` function with a single string argument containing the grammar. 
Each production rule in the grammar should be on a separate line, and the symbol should be followed by the character sequence `->`,
 and then by the substitutions. The symbol `|` is used as a delimiter on the RHS of a rule if there are multiple valid substitutions. 
 
By default the start symbol is the text `START` and `ε` is used to represent an empty string, 
 alternate values can be supplied when calling `buildParser()`.  

I have used several ES6 language features in the code, so this won't work in older browsers.

## Example

    const parser = buildParser(`
        START -> EXPR
        EXPR  -> NUM | NUM OP EXPR
        NUM   -> 0 | 1 | 2 | 3 | 4
        OP    -> + | - | * | /
    `);
    
    parser.parse('1 + 2')

Will return:

    {
        'remainder : '',
        'tree' : {
            'START' : [
                {'EXPR' : [
                    {'NUM' : ['1']},
                    {'OP' : ['+']},
                    {'EXPR' : [
                        {'NUM' : ['2']},
                    ]}
                ]}
            ]
        }
    }