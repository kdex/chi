export class Type {
	static toString() {
		return this.inspect();
	}
}
export class AnyType extends Type {
	static inspect() {
		return "any";
	}
}
export class RecursiveType extends AnyType {
	constructor(identifier) {
		super();
		this.identifier = identifier;
	}
	inspect() {
		return `∞ {${this.identifier.name}}`;
	}
	toString() {
		return this.inspect();
	}
}
export class FunctionType extends AnyType {
	constructor(domain, image) {
		super();
		this.domain = domain;
		this.image = image;
	}
	inspect() {
		const d = this.domain.length > 1;
		return `${d ? `[${this.domain.join(", ")}]` : this.domain} => ${this.image}`;
	}
	toString() {
		return this.inspect();
	}
}
export class FixedIntegerType extends AnyType {
	static width = "?";
	static makeSigned() {
		if (this.signed) {
			return this.signed;
		}
		throw new Error(`Unable to make "${this}" signed`);
	}
	static makeUnsigned() {
		if (this.unsigned) {
			return this.unsigned;
		}
		throw new Error(`Unable to make "${this}" unsigned`);
	}
	static inspect() {
		return `${this.abbreviation}${this.width}`;
	}
}
export class UintType extends FixedIntegerType {
	static abbreviation = "u";
	static makeUnsigned() {
		return this;
	}
}
export class IntType extends FixedIntegerType {
	static abbreviation = "i";
	static makeSigned() {
		return this;
	}
}
export class Uint8Type extends UintType {
	static width = 8;
}
export class Uint16Type extends UintType {
	static width = 16;
}
export class Uint32Type extends UintType {
	static width = 32;
}
export class Int8Type extends IntType {
	static width = 8;
}
export class Int16Type extends IntType {
	static width = 16;
}
export class Int32Type extends IntType {
	static width = 32;
}
export class StringType extends AnyType {
	static inspect() {
		return "string";
	}
}
export class BoolType extends AnyType {
	static inspect() {
		return "bool";
	}
}
export class VoidType extends AnyType {
	static inspect() {
		return "void";
	}
}
Uint8Type.signed = Int8Type;
Uint16Type.signed = Int16Type;
Uint32Type.signed = Int32Type;
Int8Type.unsigned = Uint8Type;
Int16Type.unsigned = Uint16Type;
Int32Type.unsigned = Uint32Type;