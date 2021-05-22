import ChiParser from "./Parser.mjs";
/* TODO: Some of these imports shouldn't be here */
import {
	Plus,
	Minus,
	Slash,
	Asterisk,
	tokenTypeMap
} from "./Lexer.mjs";
import {
	IntType,
	Int8Type,
	Int16Type,
	Int32Type,
	UintType,
	Uint8Type,
	Uint16Type,
	Uint32Type,
	StringType,
	BoolType
} from "./Types.mjs";
import {
// 	NumberValue,
	StringValue,
	Int32Value,
	BoolValue,
	Let as LetStatement,
	Equals,
	And,
	Or,
	Not,
	Id,
	BlockStatement,
	Add,
	Subtract,
	Multiply,
	Divide,
	Power,
	FunctionExpression,
	Apply,
	Cast
} from "./InterpreterClasses.mjs";
import { warn } from "print-log";
const parser = new ChiParser([]);
const locate = (start, end = start) => ({
	start: {
		line: start.startLine || start.location.start.line,
		column: start.startColumn || start.location.start.column
	},
	end: {
		line: end.endLine || end.location.end.line,
		column: end.endColumn || end.location.end.column
	}
});
function parseSuperScript(value) {
	const superscripts = "⁰¹²³⁴⁵⁶⁷⁸⁹";
	return Number.parseInt(Array.from(value).map(c => String(superscripts.indexOf(c))).join(""));
}
export default class Visitor extends parser.getBaseCstVisitorConstructor() {
	constructor() {
		super();
		this.validateVisitor();
	}
	/* Helpers */
	transform(x) {
		if (Array.isArray(x)) {
			return x.map(x => this.visit(x));
		}
		else {
			return this.visit(x);
		}
	}
	transformBlock(statement) {
		const statements = this.transform(statement);
		const [firstStatement] = statements;
		const [lastStatement] = statements.slice(-1);
		const location = locate(firstStatement, lastStatement || firstStatement);
		return new BlockStatement(location, ...statements);
	}
	/* Regular visitors */
	program({ statement }) {
		return this.transformBlock(statement);
	}
	blockStatement({ statement }) {
		return this.transformBlock(statement);
	}
	statement({ expressionStatement, blockStatement, letStatement }) {
		for (const statement of [expressionStatement, blockStatement, letStatement]) {
			if (statement) {
				return this.transform(statement)[0];
			}
		}
	}
	letStatement({ Let: [letToken], identifier, expressionStatement, type }) {
		if (type) {
			warn("LetStatement hint ignored");
			const [hint] = this.transform(type);
		}
		const [id] = this.transform(identifier);
		const [argument] = this.transform(expressionStatement);
		const location = locate(letToken, argument);
		return new LetStatement(location, id, argument);
	}
	expressionStatement({ orExpression }) {
		const [or] = this.transform(orExpression);
		return or;
	}
	orExpression({ andExpression }) {
		const [lhs, ...rhs] = this.transform(andExpression);
		return !rhs.length ? lhs : [lhs, ...rhs].reduce((r1, r2) => {
			const location = locate(r1, r2);
			return new Or(location, r1, r2);
		});
	}
	andExpression({ equalityExpression }) {
		const [lhs, ...rhs] = this.transform(equalityExpression);
		return !rhs.length ? lhs : [lhs, ...rhs].reduce((r1, r2) => {
			const location = locate(r1, r2);
			return new And(location, r1, r2);
		});
	}
	equalityExpression({ additiveExpression }) {
		const additives = this.transform(additiveExpression);
		return additives.reduce((x, y) => {
			const location = locate(x, y);
			return new Equals(location, x, y);
		});
	}
	additiveExpression({ multiplicativeExpression, AdditiveOperator: operators }) {
		const [lhs, ...rhs] = this.transform(multiplicativeExpression);
		return [lhs, ...rhs].reduce((r1, r2, i) => {
			const operator = operators[i - 1];
			const location = locate(r1, r2);
			if (operator.tokenType === Plus) {
				return new Add(location, r1, r2);
			}
			else if (operator.tokenType === Minus) {
				return new Subtract(location, r1, r2);
			}
			throw new Error("Unable to resolve additive expression");
		});
	}
	multiplicativeExpression({ notExpression, MultiplicativeOperator: operators }) {
		const [lhs, ...rhs] = this.transform(notExpression);
		return [lhs, ...rhs].reduce((r1, r2, i) => {
			const operator = operators[i - 1];
			const location = locate(r1, r2);
			if (operator.tokenType === Asterisk) {
				return new Multiply(location, r1, r2);
			}
			else if (operator.tokenType === Slash) {
				return new Divide(location, r1, r2);
			}
			throw new Error("Unable to resolve multiplicative expression");
		});
	}
	notExpression({ powerExpression, NotOperator: operator }) {
		const [operand] = this.transform(powerExpression);
		const location = locate(!operator ? operand : operator[0], operand);
		return !operator ? operand : new Not(location, operand);
	}
	powerExpression({ castExpression, powerLiteral }) {
		const [base] = this.transform(castExpression);
		if (!powerLiteral) {
			return base;
		}
		const [exponent] = this.transform(powerLiteral);
		const location = locate(base, exponent);
		return new Power(location, base, exponent);
	}
	castList({ identifier, type }) {
		const identifierTransforms = this.transform(identifier) || [];
		const typeTransforms = this.transform(type) || [];
		return {
			identifiers: identifierTransforms,
			types: typeTransforms
		};
	}
	targetCastList({ castList }) {
		return this.transform(castList)[0];
	}
	resultCastList({ castList } ) {
		return this.transform(castList)[0];
	}
	argumentList({ andExpression }) {
		if (andExpression) {
			return this.transform(andExpression);
		}
		return [];
	}
	castExpression({ termExpression, targetCastList, resultCastList, argumentList }) {
		const argumentLists = this.transform(argumentList || []);
		const [targetCasts] = this.transform(targetCastList || []);
		const [resultCasts] = this.transform(resultCastList || []);
		const [target] = this.transform(termExpression);
		const targetRuntimeTypes = targetCasts.types.map(t => tokenTypeMap.get(t.tokenType));
		const resultRuntimeTypes = resultCasts.types.map(t => tokenTypeMap.get(t.tokenType));
		const [firstResultType] = resultCasts.types;
		const [lastResultType] = resultCasts.types.slice(-1);
		const [lastTargetType] = targetCasts.types.slice(-1);
		const targetCastLocation = locate(target, !targetCasts.types.length ? target : lastTargetType);
		const resultCastLocation = locate(resultCasts.types.length ? firstResultType : target, resultCasts.types.length ? lastResultType : target);
		/*
		* identifier : (i8=>u8) (1, 2, 3) : i8:u8
		* ^^^^^^^^^^    ^^^^^^   ^^^^^^^    ^^^^^
		*   target      target  invocation  result
		*               casts   arguments   casts
		*/
		/* This expression might be followed by an invocation */
		if (targetCasts.identifiers.length || resultCasts.identifiers.length) {
			throw new Error("Identifier casts are not implemented yet.");
		}
		/* TODO: Currently, `Cast` objects receive the location of the entire cast list.
		* In the future, the location should rather be an individual cast's location.
		*/
		const targetCast = [target, ...targetRuntimeTypes].reduce((x, y) => {
			return new Cast(targetCastLocation, x, y);
		});
		const result = [targetCast, ...argumentLists].reduce((x, args) => {
			const applicationLocation = locate(target /* TODO */);
			return new Apply(applicationLocation, x, ...args);
		});
		return [result, ...resultRuntimeTypes].reduce((x, y) => {
			return new Cast(resultCastLocation, x, y);
		});
	}
	termExpression({ literal, identifier, parenthesisExpression }) {
		for (const term of [literal, identifier, parenthesisExpression]) {
			if (term) {
				return this.transform(term)[0];
			}
		}
		throw new Error("Unable to resolve term expression");
	}
	literal({ numberLiteral, stringLiteral, booleanLiteral, functionLiteral }) {
		for (const literal of [numberLiteral, stringLiteral, booleanLiteral, functionLiteral]) {
			if (literal) {
				return this.transform(literal)[0];
			}
		}
		throw new Error("Unable to resolve literal");
	}
	numberLiteral({ NumberLiteral: [number] }) {
		const conversion = Number(number.image);
		const location = locate(number);
		return new Int32Value(new Int32Array([conversion]), location);
	}
	stringLiteral({ StringLiteral: [string] }) {
		const conversion = String(
			string
			.image
			.replace(/^"|"$/g, "")
			.replace(/\\"/g, `"`)
		);
		const location = locate(string);
		return new StringValue(conversion, location);
	}
	booleanLiteral({ BooleanLiteral: [bool] }) {
		const location = locate(bool);
		return new BoolValue(bool.image === "true", location);
	}
	functionLiteral({ LeftParenthesis: [parenLeft], identifier, expressionStatement, blockStatement, RightParenthesis: [parenRight] }) {
		let body;
		const parameters = this.transform(identifier) || [];
		for (const bodyType of [expressionStatement, blockStatement]) {
			if (bodyType) {
				[body] = this.transform(bodyType);
			}
		}
		const [firstParameter] = parameters;
		const location = locate(parenLeft || firstParameter, parenRight || body);
		return new FunctionExpression(location, parameters, body);
	}
	identifier({ Identifier: [identifier] }) {
		const location = locate(identifier);
		return new Id(location, identifier.image);
	}
	parenthesisExpression({ expressionStatement }) {
		return this.transform(expressionStatement)[0];
	}
	type({ Type: [type] }) {
		return type;
	}
	powerLiteral({ PowerLiteral: [power] }) {
		const location = locate(power);
		return new Int32Value(new Int32Array([parseSuperScript(power.image)]), location);
	}
}