import { Lexer, createToken } from "chevrotain";
import { err } from "print-log";
const { SKIPPED, NA } = Lexer;
const Identifier = createToken({
	name: "Identifier",
	pattern: /[a-zA-Z]\w*/
});
const Colon = createToken({
	name: "Colon",
	pattern: /:/
});
const AdditiveOperator = createToken({
	name: "AdditiveOperator",
	pattern: NA
});
const MultiplicativeOperator = createToken({
	name: "MultiplicativeOperator",
	pattern: NA
});
const Comma = createToken({
	name: "Comma",
	pattern: /,/
});
const Plus = createToken({
	name: "Plus",
	pattern: /\+/,
	categories: [AdditiveOperator]
});
const Minus = createToken({
	name: "Minus",
	pattern: /-|–|—/,
	categories: [AdditiveOperator]
});
const Asterisk = createToken({
	name: "Asterisk",
	pattern: /\*|·|×/,
	categories: MultiplicativeOperator
});
const Slash = createToken({
	name: "Slash",
	pattern: /\//,
	categories: MultiplicativeOperator
});
const AndOperator = createToken({
	name: "AndOperator",
	pattern: /&&|∧/
});
const OrOperator = createToken({
	name: "OrOperator",
	pattern: /\|\||∨/
});
const NotOperator = createToken({
	name: "NotOperator",
	pattern: /¬|!/
});
const PowerLiteral = createToken({
	name: "PowerLiteral",
	pattern: /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/
});
const LeftBrace = createToken({
	name: "LeftBrace",
	pattern: /{/
});
const RightBrace = createToken({
	name: "RightBrace",
	pattern: /}/
});
const LeftParenthesis = createToken({
	name: "LeftParenthesis",
	pattern: /\(/
});
const RightParenthesis = createToken({
	name: "RightParenthesis",
	pattern: /\)/
});
const LeftBracket = createToken({
	name: "LeftBracket",
	pattern: /\[/
});
const RightBracket = createToken({
	name: "RightBracket",
	pattern: /\]/
});
const Literal = createToken({
	name: "Literal",
	pattern: NA
});
const BooleanLiteral = createToken({
	name: "BooleanLiteral",
	pattern: NA,
	categories: [Literal]
});
const TrueLiteral = createToken({
	name: "TrueLiteral",
	pattern: /true/,
	categories: [BooleanLiteral]
});
const FalseLiteral = createToken({
	name: "FalseLiteral",
	pattern: /false/,
	categories: [BooleanLiteral]
});
const NumberLiteral = createToken({
	name: "NumberLiteral",
	pattern: /\d+/,
	categories: [Literal]
});
const StringLiteral = createToken({
	name: "StringLiteral",
	pattern: /(")(?:\\\1|.)*?\1/,
	categories: [Literal]
});
const Semicolon = createToken({
	name: "Semicolon",
	pattern: /;/
});
const Equals = createToken({
	name: "Equals",
	pattern: /=/
});
const FatArrow = createToken({
	name: "FatArrow",
	pattern: /=>/
});
const Keyword = createToken({
	name: "Keyword",
	pattern: NA,
	longerAlt: Identifier
});
const While = createToken({
	name: "While",
	pattern: /while/,
	categories: [Keyword]
});
const For = createToken({
	name: "For",
	pattern: /for/,
	categories: [Keyword]
});
const Do = createToken({
	name: "Do",
	pattern: /do/,
	categories: [Keyword]
});
const Let = createToken({
	name: "Let",
	pattern: /let/,
	categories: [Keyword]
});
const If = createToken({
	name: "If",
	pattern: /if/,
	categories: [Keyword]
});
const Else = createToken({
	name: "Else",
	pattern: /else/,
	categories: [Keyword]
});
const Type = createToken({
	name: "Type",
	pattern: NA,
	categories: [Keyword]
});
const TypeBool = createToken({
	name: "Type",
	pattern: /bool/,
	categories: [Type]
});
const TypeInt8 = createToken({
	name: "TypeInt8",
	pattern: /i8/,
	categories: [Type]
});
const TypeInt16 = createToken({
	name: "TypeInt16",
	pattern: /i16/,
	categories: [Type]
});
const TypeInt32 = createToken({
	name: "TypeInt32",
	pattern: /i32/,
	categories: [Type]
});
const TypeUint8 = createToken({
	name: "TypeUint8",
	pattern: /u8/,
	categories: [Type]
});
const TypeUint16 = createToken({
	name: "TypeUint16",
	pattern: /u16/,
	categories: [Type]
});
const TypeUint32 = createToken({
	name: "TypeUint32",
	pattern: /u32/,
	categories: [Type]
});
const TypeString = createToken({
	name: "TypeString",
	pattern: /string/,
	categories: [Type]
});
const TypeRecursive = createToken({
	name: "TypeRecursive",
	pattern: /infinity/,
	categories: [Type]
});
const Whitespace = createToken({
	name: "Whitespace",
	pattern: /\s+/,
	group: SKIPPED,
	lineBreaks: true
});
export const allTokens = [
	Whitespace,
	LeftBrace,
	RightBrace,
	LeftParenthesis,
	RightParenthesis,
	LeftBracket,
	RightBracket,
	Literal,
	BooleanLiteral,
	AndOperator,
	OrOperator,
	NotOperator,
	TrueLiteral,
	FalseLiteral,
	NumberLiteral,
	StringLiteral,
	PowerLiteral,
	AdditiveOperator,
	Plus,
	Minus,
	MultiplicativeOperator,
	Asterisk,
	Slash,
	Semicolon,
	Colon,
	FatArrow,
	Comma,
	Equals,
	Keyword,
	If,
	Else,
	While,
	For,
	Do,
	Let,
	Type,
	TypeInt8,
	TypeInt16,
	TypeInt32,
	TypeUint8,
	TypeUint16,
	TypeUint32,
	TypeString,
	TypeBool,
	TypeRecursive,
	Identifier
];
export default class {
	internalLexer = new Lexer(allTokens);
	tokenize(string) {
		const result = this.internalLexer.tokenize(string);
		if (result.errors.length) {
			err("Lex errors detected: ", result.errors);
			throw new Error(result.errors);
		}
		return result;
	}
}