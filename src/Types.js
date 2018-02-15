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
export class FixedIntegerType extends AnyType {}
export class IntType extends FixedIntegerType {}
export class Int8Type extends IntType {
	static inspect() {
		return "i8";
	}
}
export class Int16Type extends IntType {
	static inspect() {
		return "i16";
	}
}
export class Int32Type extends IntType {
	static inspect() {
		return "i32";
	}
}
export class UintType extends FixedIntegerType {}
export class Uint8Type extends UintType {
	static inspect() {
		return "u8";
	}
}
export class Uint16Type extends UintType {
	static inspect() {
		return "u16";
	}
}
export class Uint32Type extends UintType {
	static inspect() {
		return "u32";
	}
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