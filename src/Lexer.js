import { Lexer, createToken } from "chevrotain";
import { err } from "print-log";
const { SKIPPED, NA } = Lexer;
export const Identifier = createToken({
	name: "Identifier",
	pattern: /[a-zA-Z]\w*/
});
export const Colon = createToken({
	name: "Colon",
	pattern: /:/
});
export const AdditiveOperator = createToken({
	name: "AdditiveOperator",
	pattern: NA
});
export const MultiplicativeOperator = createToken({
	name: "MultiplicativeOperator",
	pattern: NA
});
export const Comma = createToken({
	name: "Comma",
	pattern: /,/
});
export const Plus = createToken({
	name: "Plus",
	pattern: /\+/,
	categories: [AdditiveOperator]
});
export const Minus = createToken({
	name: "Minus",
	pattern: /-|–|—/,
	categories: [AdditiveOperator]
});
export const Asterisk = createToken({
	name: "Asterisk",
	pattern: /\*|·|×/,
	categories: MultiplicativeOperator
});
export const Slash = createToken({
	name: "Slash",
	pattern: /\//,
	categories: MultiplicativeOperator
});
export const AndOperator = createToken({
	name: "AndOperator",
	pattern: /&&|∧/
});
export const OrOperator = createToken({
	name: "OrOperator",
	pattern: /\|\||∨/
});
export const NotOperator = createToken({
	name: "NotOperator",
	pattern: /¬|!/
});
export const PowerLiteral = createToken({
	name: "PowerLiteral",
	pattern: /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/
});
export const LeftBrace = createToken({
	name: "LeftBrace",
	pattern: /{/
});
export const RightBrace = createToken({
	name: "RightBrace",
	pattern: /}/
});
export const LeftParenthesis = createToken({
	name: "LeftParenthesis",
	pattern: /\(/
});
export const RightParenthesis = createToken({
	name: "RightParenthesis",
	pattern: /\)/
});
export const LeftBracket = createToken({
	name: "LeftBracket",
	pattern: /\[/
});
export const RightBracket = createToken({
	name: "RightBracket",
	pattern: /\]/
});
export const Literal = createToken({
	name: "Literal",
	pattern: NA
});
export const BooleanLiteral = createToken({
	name: "BooleanLiteral",
	pattern: NA,
	categories: [Literal]
});
export const TrueLiteral = createToken({
	name: "TrueLiteral",
	pattern: /true/,
	categories: [BooleanLiteral]
});
export const FalseLiteral = createToken({
	name: "FalseLiteral",
	pattern: /false/,
	categories: [BooleanLiteral]
});
export const NumberLiteral = createToken({
	name: "NumberLiteral",
	pattern: /\d+/,
	categories: [Literal]
});
export const StringLiteral = createToken({
	name: "StringLiteral",
	pattern: /(")(?:\\\1|.)*?\1/,
	categories: [Literal]
});
export const Semicolon = createToken({
	name: "Semicolon",
	pattern: /;/
});
export const Equals = createToken({
	name: "Equals",
	pattern: /=/
});
export const FatArrow = createToken({
	name: "FatArrow",
	pattern: /=>/
});
export const Keyword = createToken({
	name: "Keyword",
	pattern: NA,
	longer_alt: Identifier
});
export const While = createToken({
	name: "While",
	pattern: /while/,
	categories: [Keyword]
});
export const For = createToken({
	name: "For",
	pattern: /for/,
	categories: [Keyword]
});
export const Do = createToken({
	name: "Do",
	pattern: /do/,
	categories: [Keyword]
});
export const Let = createToken({
	name: "Let",
	pattern: /let/,
	categories: [Keyword]
});
export const If = createToken({
	name: "If",
	pattern: /if/,
	categories: [Keyword]
});
export const Else = createToken({
	name: "Else",
	pattern: /else/,
	categories: [Keyword]
});
export const Type = createToken({
	name: "Type",
	pattern: NA,
	categories: [Keyword]
});
export const TypeBool = createToken({
	name: "TypeBool",
	pattern: /bool/,
	categories: [Type]
});
export const TypeInt = createToken({
	name: "TypeInt",
	pattern: /i/,
	categories: [Type]
});
export const TypeInt8 = createToken({
	name: "TypeInt8",
	pattern: /i8/,
	categories: [Type]
});
export const TypeInt16 = createToken({
	name: "TypeInt16",
	pattern: /i16/,
	categories: [Type]
});
export const TypeInt32 = createToken({
	name: "TypeInt32",
	pattern: /i32/,
	categories: [Type]
});
export const TypeUint = createToken({
	name: "TypeUint",
	pattern: /u/,
	categories: [Type]
});
export const TypeUint8 = createToken({
	name: "TypeUint8",
	pattern: /u8/,
	categories: [Type]
});
export const TypeUint16 = createToken({
	name: "TypeUint16",
	pattern: /u16/,
	categories: [Type]
});
export const TypeUint32 = createToken({
	name: "TypeUint32",
	pattern: /u32/,
	categories: [Type]
});
export const TypeString = createToken({
	name: "TypeString",
	pattern: /string/,
	categories: [Type]
});
export const TypeRecursive = createToken({
	name: "TypeRecursive",
	pattern: /infinity/,
	categories: [Type]
});
export const Whitespace = createToken({
	name: "Whitespace",
	pattern: /\s+/,
	group: SKIPPED,
	line_breaks: true
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
	TypeRecursive,
	TypeInt8,
	TypeInt16,
	TypeInt32,
	TypeInt,
	TypeUint8,
	TypeUint16,
	TypeUint32,
	TypeUint,
	TypeString,
	TypeBool,
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