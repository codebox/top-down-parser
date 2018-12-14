"use strict";
function buildParser(grammar, startSymbol = 'START', epsilon = 'ε') {
    const symbols = {};

    grammar.split('\n').map(line => line.trim()).forEach(line => {
        const [symbol, substitution] = line.split('->', 2).map(s => s.trim());
        if (substitution) {
            const substitutions = substitution.split('|').map(s => s.trim()).map(s => s.split(' '));
            if (substitutions.some(s => s[0] === symbol)) {
                throw new Error('Left-recursion detected in grammar');
            }
            if (!symbols[symbol]) {
                symbols[symbol] = [];
            }
            symbols[symbol].push(...substitutions);
        }
    });

    function consume(text, symbol) {
        let matches = [];

        symbols[symbol].forEach(alternative => {
            const tree = {[symbol]: []};
            let remainder = text.trim();

            const matchOk = alternative.every(part => {
                if (part === epsilon) {
                    tree[symbol].push(epsilon);
                    return true;

                } else if (symbols[part]){
                    const result = consume(remainder, part);
                    if (result) {
                        remainder = result.remainder;
                        tree[symbol].push(result.tree);
                        return true;

                    } else {
                        return false;
                    }

                } else if (remainder.indexOf(part) === 0) {
                    remainder = remainder.substr(part.length);
                    tree[symbol].push(part);
                    return true;

                } else {
                    return false;
                }
            });
            if (matchOk) {
                matches.push({remainder, tree});
            }
        });

        if (matches.length) {
            return matches.sort((r1,r2) => r1.remainder.length - r2.remainder.length)[0]; // return longest match
        }
    }

    return {
        parse(text) {
            return consume(text, startSymbol);
        }
    };
}
