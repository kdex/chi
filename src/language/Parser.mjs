import { Parser } from "chevrotain";
import {
	allTokens,
	Let,
	Identifier,
	AssignmentOperator,
	EqualityOperator,
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
	Type
} from "./Lexer.mjs";
export default class ChiParser extends Parser {
	constructor(input) {
		super(input, allTokens, {
			outputCst: true,
			recoveryEnabled: true
		});
		this.RULE("program", () => {
			this.MANY(() => {
				this.SUBRULE(this.statement);
			});
		});
		this.RULE("statement", () => {
			this.OR({
				DEF: [{
					ALT: () => {
						this.SUBRULE(this.expressionStatement);
						this.CONSUME(Semicolon);
					}
				}, {
					ALT: () => this.SUBRULE(this.blockStatement)
				}, {
					ALT: () => {
						this.SUBRULE(this.letStatement);
						this.CONSUME2(Semicolon);
					}
				}]
			});
		});
		this.RULE("blockStatement", () => {
			this.CONSUME(LeftBrace);
			this.MANY(() => {
				this.SUBRULE(this.statement);
			});
			this.CONSUME(RightBrace);
		});
		this.RULE("expressionStatement", () => {
			this.SUBRULE(this.orExpression);
		});
		this.RULE("orExpression", () => {
			this.SUBRULE(this.andExpression);
			this.MANY(() => {
				this.CONSUME(OrOperator);
				this.SUBRULE2(this.andExpression);
			});
		});
		this.RULE("andExpression", () => {
			this.SUBRULE(this.equalityExpression);
			this.MANY(() => {
				this.CONSUME(AndOperator);
				this.SUBRULE2(this.equalityExpression);
			});
		});
		this.RULE("equalityExpression", () => {
			this.SUBRULE(this.additiveExpression);
			this.MANY(() => {
				this.CONSUME(EqualityOperator);
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
			/* Cast target */
			this.SUBRULE(this.termExpression);
			/* Types that the target shall be cast to */
			this.SUBRULE(this.targetCastList);
			/* Potential invocation */
			this.MANY(() => {
				this.SUBRULE(this.argumentList);
			});
			/* Types that the result shall be cast to */
			this.SUBRULE(this.resultCastList);
		});
		this.RULE("argumentList", () => {
			this.CONSUME(LeftParenthesis);
			this.OPTION(() => {
				this.SUBRULE(this.andExpression);
				this.MANY(() => {
					this.CONSUME(Comma);
					this.SUBRULE2(this.andExpression);
				});
			});
			this.CONSUME(RightParenthesis);
		});
		this.RULE("targetCastList", () => {
			this.SUBRULE(this.castList);
		});
		this.RULE("resultCastList", () => {
			this.SUBRULE(this.castList);
		});
		this.RULE("castList", () => {
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
			this.SUBRULE(this.expressionStatement);
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
			this.CONSUME(AssignmentOperator);
			this.SUBRULE(this.expressionStatement);
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
					ALT: () => this.SUBRULE(this.expressionStatement)
				}, {
					ALT: () => {
						this.CONSUME(LeftBrace);
						this.SUBRULE2(this.blockStatement);
						this.CONSUME(RightBrace);
					}
				}]
			});
		});
		Parser.performSelfAnalysis(this);
	}
};