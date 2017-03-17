export class Type {}
export class AnyType extends Type {
	static inspect() {
		return "any";
	}
	static toString() {
		return this.inspect();
	}
}
export class RecursiveType extends AnyType {
	static inspect() {
		return "∞";
	}
	static toString() {
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
export class IntType extends AnyType {}
export class Int8Type extends IntType {
	static inspect() {
		return "i8";
	}
	static toString() {
		return this.inspect();
	}
}
export class Int16Type extends IntType {
	static inspect() {
		return "i16";
	}
	static toString() {
		return this.inspect();
	}
}
export class Int32Type extends IntType {
	static inspect() {
		return "i32";
	}
	static toString() {
		return this.inspect();
	}
}
export class StringType extends AnyType {
	static inspect() {
		return "string";
	}
	static toString() {
		return this.inspect();
	}
}
export class BoolType extends AnyType {
	static inspect() {
		return "bool";
	}
	static toString() {
		return this.inspect();
	}
}
export class VoidType {
	static inspect() {
		return "void";
	}
	static toString() {
		return "void";
	}
}