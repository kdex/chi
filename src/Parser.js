import { Parser } from "chevrotain";
import {
	allTokens,
	Let,
	Identifier,
	Equals,
	NumberLiteral,
	StringLiteral,
	PowerLiteral,
	BooleanLiteral,
	AndOperator,
	OrOperator,
	NotOperator,
	Semicolon,
	Plus,
	AdditiveOperator,
	MultiplicativeOperator,
	Minus,
	Asterisk,
	Slash,
	LeftParenthesis,
	RightParenthesis,
	LeftBrace,
	RightBrace,
	FatArrow,
	Comma,
	Colon,
	Type,
	TypeInt,
	TypeInt8,
	TypeInt16,
	TypeInt32,
	TypeUint,
	TypeUint8,
	TypeUint16,
	TypeUint32,
	TypeString,
	TypeBool
} from "./Lexer";
import {
// 	NumberValue,
	StringValue,
	Int32Value,
	BoolValue,
	Let as LetStatement,
	And,
	Or,
	Not,
	Id,
	Block,
	Add,
	Subtract,
	Multiply,
	Divide,
	Power,
	FunctionExpression,
	Apply,
	Cast
} from "./InterpreterClasses";
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
} from "./Types";
function parseSuperScript(value) {
	const superscripts = "⁰¹²³⁴⁵⁶⁷⁸⁹";
	return Number.parseInt(Array.from(value).map(c => String(superscripts.indexOf(c))).join(""));
}
export default class ChiParser extends Parser {
	constructor(input) {
		super(input, allTokens, {
			outputCst: true,
			recoveryEnabled: true
		});
		this.RULE("block", () => this.MANY(() => this.SUBRULE(this.statement)));
		this.RULE("statement", () => {
			this.OR({
				DEF: [{
					ALT: () => this.SUBRULE(this.expression)
				}, {
					ALT: () => this.SUBRULE(this.letStatement)
				}]
			});
			this.OPTION({
				DEF: () => this.CONSUME(Semicolon)
			});
		});
		this.RULE("expression", () => {
			this.SUBRULE(this.andExpression);
			this.MANY(() => {
				this.CONSUME(LeftParenthesis);
				this.OPTION2(() => {
					this.SUBRULE2(this.andExpression);
					this.MANY2(() => {
						this.CONSUME(Comma);
						this.SUBRULE3(this.andExpression);
					});
				});
				this.CONSUME(RightParenthesis);
			});
		});
		this.RULE("andExpression", () => {
			this.SUBRULE(this.orExpression);
			this.MANY(() => {
				this.CONSUME(AndOperator);
				this.SUBRULE2(this.orExpression);
			});
		});
		this.RULE("orExpression", () => {
			this.SUBRULE(this.additiveExpression);
			this.MANY(() => {
				this.CONSUME(OrOperator);
				this.SUBRULE2(this.additiveExpression);
			});
		});
		this.RULE("additiveExpression", () => {
			this.SUBRULE(this.multiplicativeExpression);
			this.MANY(() => {
				this.CONSUME(AdditiveOperator);
				this.SUBRULE2(this.multiplicativeExpression);
			});
		});
		this.RULE("multiplicativeExpression", () => {
			this.SUBRULE(this.notExpression);
			this.MANY(() => {
				this.CONSUME(MultiplicativeOperator);
				this.SUBRULE2(this.notExpression);
			});
		});
		this.RULE("notExpression", () => {
			this.OPTION({
				DEF: () => this.CONSUME(NotOperator)
			});
			this.SUBRULE(this.powerExpression);
			// if (!operand) {
			// 	return this.SUBRULE2(this.powerExpression);
			// }
		});
		this.RULE("powerExpression", () => {
			this.SUBRULE(this.castExpression);
			this.OPTION({
				DEF: () => this.SUBRULE2(this.powerLiteral)
			});
		});
		this.RULE("castExpression", () => {
			this.SUBRULE(this.termExpression);
			this.MANY(() => {
				this.CONSUME(Colon);
				this.OR({
					DEF: [{
						ALT: () => this.SUBRULE(this.identifier)
					}, {
						ALT: () => this.SUBRULE(this.type)
					}]
				});
			});
		});
		this.RULE("type", () => {
			this.CONSUME(Type);
		});
		this.RULE("powerLiteral", () => {
			this.CONSUME(PowerLiteral);
		});
		this.RULE("termExpression", () => {
			this.OR({
				DEF: [{
					ALT: () => this.SUBRULE(this.literal)
				}, {
					ALT: () => this.SUBRULE(this.identifier)
				}, {
					ALT: () => this.SUBRULE(this.parenthesisExpression)
				}]
			});
		});
		this.RULE("identifier", () => {
			this.CONSUME(Identifier);
		});
		this.RULE("parenthesisExpression", () => {
			this.CONSUME(LeftParenthesis);
			this.SUBRULE(this.expression);
			this.CONSUME(RightParenthesis);
		});
		this.RULE("letStatement", () => {
			this.CONSUME(Let);
			this.SUBRULE(this.identifier);
			this.OPTION({
				DEF: () => {
					this.CONSUME(Colon);
					this.SUBRULE(this.type);
				}
			});
			this.CONSUME(Equals);
			this.SUBRULE(this.expression);
		});
		this.RULE("literal", () => {
			return this.OR({
				DEF: [{
					ALT: () => this.SUBRULE(this.numberLiteral)
				}, {
					ALT: () => this.SUBRULE(this.stringLiteral)
				}, {
					ALT: () => this.SUBRULE(this.booleanLiteral)
				}, {
					ALT: () => this.SUBRULE(this.functionLiteral)
				}]
			});
		});
		this.RULE("numberLiteral", () => {
			this.CONSUME(NumberLiteral);
		});
		this.RULE("stringLiteral", () => {
			this.CONSUME(StringLiteral);
		});
		this.RULE("booleanLiteral", () => {
			this.CONSUME(BooleanLiteral);
		});
		this.RULE("functionLiteral", () => {
			this.OR({
				DEF: [{
					/* Argument list contains parentheses */
					ALT: () => {
						this.CONSUME(LeftParenthesis);
						this.OPTION({
							DEF: () => {
								this.SUBRULE(this.identifier);
								this.MANY(() => {
									this.CONSUME(Comma);
									this.SUBRULE2(this.identifier);
								});
							}
						});
						this.CONSUME(RightParenthesis);
					}
				}, {
					/* Argument list is just an identifier */
					ALT: () => [this.SUBRULE3(this.identifier)]
				}]
			});
			this.CONSUME(FatArrow);
			this.OR2({
				DEF: [{
					ALT: () => this.SUBRULE(this.expression)
				}, {
					ALT: () => {
						this.CONSUME(LeftBrace);
						this.SUBRULE2(this.block);
						this.CONSUME(RightBrace);
					}
				}]
			});
		});
		Parser.performSelfAnalysis(this);
	}
}
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
const tokenTypeMap = new Map([
	[TypeInt, IntType],
	[TypeInt8, Int8Type],
	[TypeInt16, Int16Type],
	[TypeInt32, Int32Type],
	[TypeUint, UintType],
	[TypeUint8, Uint8Type],
	[TypeUint16, Uint16Type],
	[TypeUint32, Uint32Type],
	[TypeString, StringType],
	[TypeBool, BoolType]
]);
/**
* Recursively transforms a CST to an AST
* @param {object} cst
*	A concrete syntax tree
* @returns {object}
*	An abstract syntax tree
*/
export function transform(cst) {
	const { children } = cst;
	switch (cst.name) {
		case "block": {
			const { statement } = children;
			const statements = statement.map(transform);
			const [firstStatement] = statements;
			const [lastStatement] = statements.slice(-1);
			const location = locate(firstStatement, lastStatement || firstStatement);
			return new Block(location, ...statements);
		}
		case "statement": {
			const { expression, letStatement } = children;
			for (const statement of [expression, letStatement]) {
				if (statement.length) {
					return statement.map(transform)[0];
				}
			}
			/* TODO: untested */
			break;
		}
		case "letStatement": {
			const { Let: [letToken], identifier, expression, type } = children;
			const [hint] = type.map(transform);
			const [id] = identifier.map(transform);
			const [argument] = expression.map(transform);
			const location = locate(letToken, argument);
			return new LetStatement(location, id, argument);
		}
		case "expression": {
			const { LeftParenthesis: [leftParen], andExpression, RightParenthesis: [rightParen] } = children;
			const [and, ...invocationArgs] = andExpression.map(transform);
			const [lastArgument] = invocationArgs.slice(-1);
			const location = locate(leftParen ? leftParen : and, rightParen ? rightParen : lastArgument);
			return !invocationArgs.length ? and : new Apply(location, and, ...invocationArgs);
		}
		case "andExpression": {
			const { orExpression } = children;
			const [lhs, ...rhs] = orExpression.map(transform);
			return !rhs.length ? lhs : [lhs, ...rhs].reduce((r1, r2) => {
				const location = locate(r1, r2);
				return new And(location, r1, r2);
			});
		}
		case "orExpression": {
			const { additiveExpression } = children;
			const [lhs, ...rhs] = additiveExpression.map(transform);
			return !rhs.length ? lhs : [lhs, ...rhs].reduce((r1, r2) => {
				const location = locate(r1, r2);
				return new Or(location, r1, r2);
			});
		}
		case "additiveExpression": {
			const { multiplicativeExpression, AdditiveOperator: operators } = children;
			const [lhs, ...rhs] = multiplicativeExpression.map(transform);
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
		case "multiplicativeExpression": {
			const { notExpression, MultiplicativeOperator: operators } = children;
			const [lhs, ...rhs] = notExpression.map(transform);
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
		case "notExpression": {
			const { powerExpression, NotOperator: [operator] } = children;
			const [operand] = powerExpression.map(transform);
			const location = locate(!operator ? operand : operator, operand);
			return !operator ? operand : new Not(location, operand);
		}
		case "powerExpression": {
			const { castExpression, powerLiteral } = children;
			const [base] = castExpression.map(transform);
			const [exponent] = powerLiteral.map(transform);
			const location = locate(base, !exponent ? base : exponent);
			return !exponent ? base : new Power(location, base, exponent);
		}
		case "castExpression": {
			const { termExpression, identifier, type } = children;
			const [value] = termExpression.map(transform);
			const typeTransforms = type.map(transform);
			const runtimeTypes = typeTransforms.map(t => tokenTypeMap.get(t.tokenType));
			const [lastType] = typeTransforms.slice(-1);
			const location = locate(value, !type.length ? value : lastType);
			if (identifier.length) {
				throw new Error("Custom casts not implemented yet");
			}
			return [value, ...runtimeTypes].reduce((x, y) => {
				return new Cast(location, x, y);
			});
		}
		case "termExpression": {
			const { literal, identifier, parenthesisExpression } = children;
			for (const term of [literal, identifier, parenthesisExpression]) {
				if (term.length) {
					return term.map(transform)[0];
				}
			}
			throw new Error("Unable to resolve term expression");
		}
		case "literal": {
			const { numberLiteral, stringLiteral, booleanLiteral, functionLiteral } = children;
			for (const literal of [numberLiteral, stringLiteral, booleanLiteral, functionLiteral]) {
				if (literal.length) {
					return literal.map(transform)[0];
				}
			}
			throw new Error("Unable to resolve literal");
		}
		case "numberLiteral": {
			const { NumberLiteral: [number] } = children;
			const conversion = Number(number.image);
			const location = locate(number);
			return new Int32Value(location, new Int32Array([conversion]));
		}
		case "stringLiteral": {
			const { StringLiteral: [string] } = children;
			const conversion = String(
				string
				.image
				.replace(/^"|"$/g, "")
				.replace(/\\"/g, `"`)
			);
			const location = locate(string);
			return new StringValue(location, conversion);
		}
		case "booleanLiteral": {
			const { BooleanLiteral: [bool] } = children;
			const location = locate(bool);
			return new BoolValue(location, bool.image === "true");
		}
		case "functionLiteral": {
			let body;
			const { LeftParenthesis: [parenLeft], identifier, expression, block, RightParenthesis: [parenRight] } = children;
			const parameters = identifier.map(transform);
			for (const bodyType of [expression, block]) {
				if (bodyType.length) {
					[body] = bodyType.map(transform);
				}
			}
			const [firstParameter] = parameters;
			const location = locate(parenLeft || firstParameter, parenRight || body);
			return new FunctionExpression(location, parameters, body);
		}
		case "identifier": {
			const { Identifier: [identifier] } = children;
			const location = locate(identifier);
			return new Id(location, identifier.image);
		}
		case "parenthesisExpression": {
			const { expression } = children;
			return expression.map(transform)[0];
		}
		case "type": {
			const { Type: [type] } = children;
			return type;
		}
		case "powerLiteral": {
			const { PowerLiteral: [power] } = children;
			const location = locate(power);
			return new Int32Value(location, new Int32Array([parseSuperScript(power.image)]));
		}
		default: {
			throw new Error(`CST transformation not implemented for CST node "${cst.name}"`);
		}
	}
}