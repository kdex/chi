import Lexer from "./Lexer";
import Parser, { transform } from "./Parser";
import interpret from "./Interpreter";
import checkTypes from "./TypeSystem";
import { debug, err } from "print-log";
import { inspect } from "util";
export function run(source) {
	debug("Tokenizing source…");
	const lexer = new Lexer();
	const { tokens } = lexer.tokenize(source);
	debug("Tokenization successful. Token stream is shown below.");
	debug(tokens);
	debug("Parsing tokens…");
	const parser = new Parser(tokens);
	const cst = parser.program();
	if (parser.errors.length) {
		err("Parsing failed.");
		throw new Error(parser.errors);
	}
	debug("CST generation successful. CST is shown below.");
	debug(inspect(cst, {
		depth: null,
		showHidden: false
	}));
	const ast = transform(cst);
	debug("AST generation successful. AST is shown below.");
	debug(inspect(ast, {
		depth: null,
		showHidden: false
	}));
	try {
		debug("Checking types…");
		checkTypes(ast);
		debug("Type check successful. Enhanced AST is shown below.");
		debug(inspect(ast, {
			depth: null,
			showHidden: false
		}));
	}
	catch (e) {
		err("Static type check failed. Partially enhanced AST is shown below.");
		debug(inspect(ast, {
			depth: null,
			showHidden: false
		}));
		throw e;
	}
	try {
		debug("Interpreting…");
		const [result, store] = interpret(ast);
		debug(store);
		debug(result);
		return {
			result,
			store
		};
	}
	catch (e) {
		err(e.message);
		err("Interpretation failed");
		throw e;
	}
}
export default run;
export {
	Lexer,
	Parser,
	transform,
	interpret,
	checkTypes
};