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
export class IntType extends FixedIntegerType {
	static inspect() {
		return `i${this.width}`;
	}
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
export class UintType extends FixedIntegerType {
	static inspect() {
		return `u${this.width}`;
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