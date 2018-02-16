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
const differentiateSingleLetter = letter => (text, offset, matchedTokens, groups) => {
	const [lastMatched] = matchedTokens.slice(-1);
	if (lastMatched && lastMatched.tokenType === Colon) {
		/* After colon, try to match identifier */
		const rest = text.substr(offset);
		const match = rest.match(Identifier.PATTERN);
		if (match) {
			if (match[0].length > 1) {
				return null;
			}
			if (rest.startsWith(letter)) {
				return letter;
			}
		}
	}
	return null;
};
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
export const AssignmentOperator = createToken({
	name: "AssignmentOperator",
	pattern: /=/
});
export const EqualityOperator = createToken({
	name: "EqualityOperator",
	pattern: /==/
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
const createKeywordToken = (name, rest = {}) => createToken({
	name,
	pattern: new RegExp(name.toLowerCase()),
	longer_alt: Identifier,
	categories: [Keyword],
	...rest
});
export const While = createKeywordToken("While");
export const For = createKeywordToken("For");
export const Do = createKeywordToken("Do");
export const Let = createKeywordToken("Let");
export const If = createKeywordToken("It");
export const Else = createKeywordToken("Else");
export const Type = createKeywordToken("Type", NA);
const createTypeToken = (name, pattern, rest = {}) => createKeywordToken(name, {
	name,
	pattern,
	categories: [Type],
	...rest
});
export const TypeBool = createTypeToken("TypeBool", /bool/);
export const TypeInt = createTypeToken("TypeInt", {
	exec: differentiateSingleLetter("i")
});
export const TypeInt8 = createTypeToken("TypeInt8", /i8/);
export const TypeInt16 = createTypeToken("TypeInt16", /i16/);
export const TypeInt32 = createTypeToken("TypeInt32", /i32/);
export const TypeUint = createTypeToken("TypeUint", {
	exec: differentiateSingleLetter("u")
});
export const TypeUint8 = createTypeToken("TypeUint8", /u8/);
export const TypeUint16 = createTypeToken("TypeUint16", /u16/);
export const TypeUint32 = createTypeToken("TypeUint32", /u32/);
export const TypeString = createTypeToken("TypeString", /string/);
export const TypeRecursive = createTypeToken("TypeRecursive", /infinity/);
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
	EqualityOperator,
	AssignmentOperator,
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
			throw new Error(result.errors.map(x => x.message).join("\n"));
		}
		return result;
	}
}