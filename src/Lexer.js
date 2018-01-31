import { Lexer } from "chevrotain";
import { err } from "print-log";
import {
	Int8Type as i8,
	Int16Type as i16,
	Int32Type as i32,
	Uint8Type as u8,
	Uint16Type as u16,
	Uint32Type as u32,
	StringType as string,
	BoolType as bool,
	RecursiveType as infinity
} from "./Types";
const { SKIPPED, NA } = Lexer;
/* TODO: Implement LINE_BREAKS: https://sap.github.io/chevrotain/website/Building_Grammars/resolving_lexer_errors.html#LINE_BREAKS */
export class Identifier {
	static PATTERN = /[a-zA-Z]\w*/;
}
export class Colon {
	static PATTERN = /:/;
}
export class AdditiveOperator {
	static PATTERN = NA;
}
export class MultiplicativeOperator {
	static PATTERN = NA;
}
export class Comma {
	static PATTERN = /,/;
}
export class Plus {
	static PATTERN = /\+/;
	static CATEGORIES = AdditiveOperator;
}
export class Minus {
	static PATTERN = /-|–|—/;
	static CATEGORIES = AdditiveOperator;
}
export class Asterisk {
	static PATTERN = /\*|·|×/;
	static CATEGORIES = MultiplicativeOperator;
}
export class Slash {
	static PATTERN = /\//;
	static CATEGORIES = MultiplicativeOperator;
}
export class AndOperator {
	static PATTERN = /&&|∧/;
}
export class OrOperator {
	static PATTERN = /\|\||∨/;
}
export class NotOperator {
	static PATTERN = /¬|!/;
}
export class PowerLiteral {
	static PATTERN = /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/;
}
export class LeftBrace {
	static PATTERN = /{/;
}
export class RightBrace {
	static PATTERN = /}/;
}
export class LeftParenthesis {
	static PATTERN = /\(/;
}
export class RightParenthesis {
	static PATTERN = /\)/;
}
export class LeftBracket {
	static PATTERN = /\[/;
}
export class RightBracket {
	static PATTERN = /\]/;
}
export class Literal {
	static PATTERN = NA;
}
export class BooleanLiteral {
	static PATTERN = NA;
	static CATEGORIES = Literal;
}
export class TrueLiteral {
	static PATTERN = /true/;
	static CATEGORIES = BooleanLiteral;
}
export class FalseLiteral {
	static PATTERN = /false/;
	static CATEGORIES = BooleanLiteral;
}
export class NumberLiteral {
	static PATTERN = /\d+/;
	static CATEGORIES = Literal;
}
export class StringLiteral {
	static PATTERN = /(")(?:\\\1|.)*?\1/;
	static CATEGORIES = Literal;
}
export class Semicolon {
	static PATTERN = /;/;
}
export class Equals {
	static PATTERN = /=/;
}
export class FatArrow {
	static PATTERN = /=>/;
}
export class Keyword {
	static PATTERN = NA;
	static LONGER_ALT = Identifier;
}
export class While {
	static PATTERN = /while/;
	static CATEGORIES = Keyword;
}
export class For {
	static PATTERN = /for/;
	static CATEGORIES = Keyword;
}
export class Do {
	static PATTERN = /do/;
	static CATEGORIES = Keyword;
}
export class Let {
	static PATTERN = /let/;
	static CATEGORIES = Keyword;
}
export class If {
	static PATTERN = /if/;
	static CATEGORIES = Keyword;
}
export class Else {
	static PATTERN = /else/;
	static CATEGORIES = Keyword;
}
export class Type {
	static PATTERN = NA;
	static CATEGORIES = Keyword;
}
export class TypeBool {
	static PATTERN = /bool/;
	static TYPE = bool;
	static CATEGORIES = Type;
}
export class TypeInt8 {
	static PATTERN = /i8/;
	static TYPE = i8;
	static CATEGORIES = Type;
}
export class TypeInt16 {
	static PATTERN = /i16/;
	static TYPE = i16;
	static CATEGORIES = Type;
}
export class TypeInt32 {
	static PATTERN = /i32/;
	static TYPE = i32;
	static CATEGORIES = Type;
}
export class TypeUint8 {
	static PATTERN = /u8/;
	static TYPE = u8;
	static CATEGORIES = Type;
}
export class TypeUint16 {
	static PATTERN = /u16/;
	static TYPE = u16;
	static CATEGORIES = Type;
}
export class TypeUint32 {
	static PATTERN = /u32/;
	static TYPE = u32;
	static CATEGORIES = Type;
}
export class TypeString {
	static PATTERN = /string/;
	static TYPE = string;
	static CATEGORIES = Type;
}
export class TypeRecursive {
	static PATTERN = /infinity/;
	static TYPE = infinity;
	static CATEGORIES = Type;
}
export class Whitespace {
	static PATTERN = /\s+/;
	static GROUP = SKIPPED;
	static LINE_BREAKS = true;
}
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