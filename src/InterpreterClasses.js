import {
	Int8Type,
	Int16Type,
	Int32Type,
	Uint8Type,
	Uint16Type,
	Uint32Type,
	StringType,
	BoolType,
	FunctionType,
	RecursiveType
} from "./Types";
const add = (x, y) => x + y;
const subtract = (x, y) => x - y;
const multiply = (x, y) => x * y;
const divide = (x, y) => x / y;
const raise = (x, y) => x ** y;
export class Environment extends Map {
	set(name, location) {
		super.set(name, location);
		return location;
	}
}
export class Store extends Map {
	static location = 0;
	at(location) {
		return this.get(location);
	}
	set(location, value) {
		super.set(location, value);
		return location;
	}
	get nextLocation() {
		return Store.location++;
	}
}
export class Locatable {
	typeHint = null;
	constructor(location = null) {
		this.location = location;
	}
	getHint() {
		const parens = this.typeHint instanceof FunctionType || this.typeHint instanceof RecursiveType;
		return `${parens ? "(" : ""}${this.typeHint || "?"}${parens ? ")" : ""}`;
	}
	toString() {
		if (this.inspect) {
			return this.inspect();
		}
		return super.toString();
	}
}
export class Block extends Locatable {
	constructor(location, ...content) {
		super(location);
		this.content = content;
	}
}
export class Statement extends Locatable {
	constructor(location, content = null) {
		super(location);
		this.value = content;
	}
}
export class Expression extends Locatable {}
export class Value extends Locatable {
	equals(left, right) {
		return this.constructor.compute(left, right, (x, y) => x == y);
	}
	constructor(location, primitive) {
		super(location);
		this.value = primitive;
	}
	copy(...args) {
		return new this.constructor(null, ...args);
	}
}
export class Operator extends Expression {}
export class BinaryOperator extends Operator {
	constructor(location, left, right) {
		super(location);
		this.left = left;
		this.right = right;
	}
}
export class UnaryOperator extends Operator {
	constructor(location, operand) {
		super(location);
		this.operand = operand;
	}
}
export class Equals extends BinaryOperator {}
export class And extends BinaryOperator {}
export class Or extends BinaryOperator {}
export class Not extends UnaryOperator {}
export class Add extends BinaryOperator {}
export class Subtract extends BinaryOperator {}
export class Multiply extends BinaryOperator {}
export class Divide extends BinaryOperator {}
export class Power extends BinaryOperator {}
export class Let extends Statement {
	constructor(location, identifier, expression) {
		super(location, expression);
		this.identifier = identifier;
	}
	toString() {
		return `Let(${this.identifier.name}):${this.getHint()}`;
	}
}
export class FunctionExpression extends Expression {
	constructor(location, parameters, body) {
		super(location);
		this.parameters = parameters;
		this.body = body;
	}
	toString() {
		return `Function:${this.getHint()}`;
	}
}
export class Apply extends Expression {
	constructor(location, target, ...args) {
		super(location);
		this.target = target;
		this.args = args;
	}
}
export class Id extends Expression {
	constructor(location, name) {
		super(location);
		this.name = name;
	}
	inspect() {
		return `${this.name}:${this.getHint()}`;
	}
}
export class Cast extends Locatable {
	constructor(location, target, to) {
		super(location);
		this.target = target;
		this.to = to;
	}
}
export class StringValue extends Value {
	type = StringType;
	to(type) {
		if (type === StringType) {
			return this;
		}
		else {
			throw new TypeError(`Can't cast string "${this.value}" to anything but strings`);
		}
	}
	concatenate(string) {
		return new StringValue(null, this.value + string.value);
	}
	inspect() {
		return this.value;
	}
}
export class BoolValue extends Value {
	type = BoolType;
	not() {
		return this.copy(!this.value);
	}
	and(op) {
		return this.copy(this.value && op.value);
	}
	or(op) {
		return this.copy(this.value || op.value);
	}
	to(type) {
		if (type === BoolType) {
			return this;
		}
		else {
			throw new TypeError(`Can't cast boolean "${this.value}" to anything but bools`);
		}
	}
	inspect() {
		return `${this.value}:${this.type}`;
	}
}
export class NumberValue extends Value {
	get number() {
		return this.value[0];
	}
	compute(op, f) {
		return f(this.number, op.number);
	}
	equals(op) {
		return new BoolValue(null, this.compute(op, (x, y) => x == y));
	}
	copy(n) {
		return super.copy(this.value.constructor.from([n]));
	}
	copyCompute(op, f) {
		return this.copy(this.compute(op, f));
	}
	add(op) {
		return this.copyCompute(op, add);
	}
	subtract(op) {
		return this.copyCompute(op, subtract);
	}
	multiply(op) {
		return this.copyCompute(op, multiply);
	}
	divide(op) {
		return this.copyCompute(op, divide);
	}
	raise(op) {
		return this.copyCompute(op, raise);
	}
	to(type) {
		if (type === Int8Type) {
			return new Int8Value(null, Int8Array.from(this.value));
		}
		else if (type === Int16Type) {
			return new Int16Value(null, Int16Array.from(this.value));
		}
		else if (type === Int32Type) {
			return new Int32Value(null, Int32Array.from(this.value));
		}
		if (type === Uint8Type) {
			return new Uint8Value(null, Uint8Array.from(this.value));
		}
		else if (type === Uint16Type) {
			return new Uint16Value(null, Uint16Array.from(this.value));
		}
		else if (type === Uint32Type) {
			return new Uint32Value(null, Uint32Array.from(this.value));
		}
		else {
			throw new Error(`Cast not impemented: ${type}`);
		}
	}
	inspect() {
		return `${this.value[0]}:${this.type}`;
	}
}
export class IntValue extends NumberValue {}
export class Int8Value extends IntValue {
	type = Int8Type;
}
export class Int16Value extends IntValue {
	type = Int16Type;
}
export class Int32Value extends IntValue {
	type = Int32Type;
}
export class UintValue extends NumberValue {}
export class Uint8Value extends UintValue {
	type = Uint8Type;
}
export class Uint16Value extends UintValue {
	type = Uint16Type;
}
export class Uint32Value extends UintValue {
	type = Uint32Type;
}
export class ClosureValue extends Value {
	constructor(parameters, body, environment) {
		super(null);
		this.parameters = parameters;
		this.body = body;
		this.environment = environment;
	}
	inspect() {
		const parameters = this.parameters.map(p => p.name);
		return `Closure(${parameters.join(", ")}):${this.getHint()}`;
	}
}