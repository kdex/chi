import { err, warn } from "print-log";
import { ReferenceError } from "./Error";
import {
	Block,
	Let,
	Id,
	Operator,
	BinaryOperator,
	UnaryOperator,
	Equals,
	Add,
	Subtract,
	Multiply,
	Divide,
	Power,
	And,
	Or,
	Not,
	Environment,
	Store,
	Value,
	NumberValue,
	IntValue,
	Int8Value,
	Int16Value,
	Int32Value,
	UintValue,
	Uint8Value,
	Uint16Value,
	Uint32Value,
	StringValue,
	BoolValue,
	FunctionExpression,
	Apply,
	Cast
} from "./InterpreterClasses";
import {
	IntType,
	Int8Type,
	Int16Type,
	Int32Type,
	UintType,
	Uint8Type,
	Uint16Type,
	Uint32Type,
	FixedIntegerType,
	StringType,
	BoolType,
	FunctionType,
	VoidType,
	RecursiveType,
	AnyType
} from "./Types";
const infer = (expression, type) => {
	if (expression.typeHint) {
		if (expression.typeHint !== type) {
			/* TODO: Recursive type check */
			warn(`Overwrote type hint "${expression.typeHint}" of "${expression}" with "${type}".`);
// 			throw new Error(`Overwrote type hint "${expression.typeHint}" of "${expression}" with "${type}".`);
		}
	}
	expression.typeHint = type;
};
export function getGreaterDomain(left, right) {
	if (
		IntType.isPrototypeOf(left) && IntType.isPrototypeOf(right) ||
		UintType.isPrototypeOf(left) && UintType.isPrototypeOf(right)
	) {
		if (left.width >= right.width) {
			return left;
		}
		else {
			return right;
		}
	}
	throw new Error(`Implicit cast is not allowed ("${left}", "${right}")`);
}
const getTypeOf = (expression, environment = new Environment(), store = new Store()) => {
	const typeOf = (expression, env = environment, s = store) => getTypeOf(expression, env, s);
	/* TODO: RecursiveType check necessary */
	function valueMatchesType(value, type, env = environment) {
		const trivialChecks = (
			type === AnyType || (
				value instanceof Int8Value && type === Int8Type ||
				value instanceof Int16Value && type === Int16Type ||
				value instanceof Int32Value && type === Int32Type ||
				value instanceof Uint8Value && type === Uint8Type ||
				value instanceof Uint16Value && type === Uint16Type ||
				value instanceof Uint32Value && type === Uint32Type ||
				value instanceof StringValue && type === StringType ||
				value instanceof BoolValue && type === BoolType
			)
		);
		if (trivialChecks) {
			return trivialChecks;
		}
		if (value instanceof FunctionExpression) {
			if (type instanceof FunctionType) {
				const { domain } = type;
				const { parameters } = value;
				const map = parameters.map((parameter, i) => {
					return valueMatchesType(parameter, domain[i], env);
				});
				err("This part hasn't been debugged yet");
				return map.every(v => v);
			}
		}
		return false;
	}
	if (expression instanceof Block) {
		const { content } = expression;
		let result, s = store;
		for (const expression of content) {
			const [type, newStore] = typeOf(expression, environment, s);
			result = type;
			s = newStore;
		}
		return [result, s];
	}
	else if (expression instanceof Let) {
		const { identifier, value: boundExpression } = expression;
		const { name } = identifier;
		const { typeHint } = identifier;
		try {
			const [type, s1] = typeOf(boundExpression);
// 			if (typeHint && type !== typeHint) {
				/* TODO: Re-implement after recursive type checks */
// 				throw new TypeError(`Tried to declare "${name}" with type "${typeHint}", but bound to a value of type "${type}"`);
// 			}
// 			else {
				infer(identifier, type);
				infer(expression, type);
				const newStore = new Store(s1);
				const location = environment.set(name, newStore.nextLocation);
				newStore.set(location, type);
				return [type, newStore];
// 			}
		}
		catch (e) {
			if (e instanceof ReferenceError) {
				/* Did the user try to use a reference to the same variable? */
				if (e.reference === name) {
					if (boundExpression instanceof FunctionExpression) {
						/* Functions may lazily refer to themselves */
						const location = environment.set(name, store.nextLocation);
						store.set(location, new RecursiveType(identifier));
						const [type, s1] = typeOf(boundExpression);
						infer(identifier, type);
						infer(expression, type);
						return [type, s1];
					}
					else {
						throw new ReferenceError(name, `Can not use an undeclared reference for "${name}" within its own definition`);
					}
				}
			}
			throw e;
		}
	}
	else if (expression instanceof Operator) {
		if (expression instanceof BinaryOperator) {
			const [left, s1] = typeOf(expression.left);
			const [right, s2] = typeOf(expression.right, environment, s1);
			if (left === AnyType && right === AnyType) {
				return [AnyType, s2];
			}
			if (left === StringType && right === StringType) {
				infer(expression, StringType);
				return [StringType, s2];
			}
			const greaterDomain = FixedIntegerType.isPrototypeOf(left) && FixedIntegerType.isPrototypeOf(right) ? getGreaterDomain(left, right) : null;
			if (expression instanceof Equals) {
				if (left !== right) {
					throw new TypeError(`The operator "==" is not defined for operands of type "${left}" and "${right}".`);
				}
				else {
					infer(expression, BoolType);
					return [BoolType, s2];
				}
			}
			if (expression instanceof And) {
				if (left !== BoolType || right !== BoolType) {
					throw new TypeError(`The operator "∧" is not defined for operands of type "${left}" and "${right}".`);
				}
				else {
					infer(expression, BoolType);
					return [BoolType, s2];
				}
			}
			else if (expression instanceof Or) {
				if (left !== BoolType || right !== BoolType) {
					throw new TypeError(`The operator "∨" is not defined for operands of type "${left}" and "${right}".`);
				}
				else {
					infer(expression, BoolType);
					return [BoolType, s2];
				}
			}
			/* Arithmetic operators may have a cast hint, which allows us to skip inference */
			if (expression.typeHint) {
				return [expression.typeHint, s2];
			}
			else if (expression instanceof Add) {
				if (left === StringType && right === StringType) {
					infer(expression, StringType);
					return [StringType, s2];
				}
				if (FixedIntegerType.isPrototypeOf(left) && FixedIntegerType.isPrototypeOf(right)) {
					infer(expression, greaterDomain);
					return [greaterDomain, s2];
				}
				else {
					throw new TypeError(`The operator "+" is not defined for operands of type "${left}" and "${right}".`);
				}
			}
			else if (expression instanceof Subtract) {
				if (FixedIntegerType.isPrototypeOf(left) && FixedIntegerType.isPrototypeOf(right)) {
					infer(expression, greaterDomain);
					return [greaterDomain, s2];
				}
				else {
					throw new TypeError(`The operator "-" is not defined for operands of type "${left}" and "${right}".`);
				}
			}
			else if (expression instanceof Multiply) {
				if (FixedIntegerType.isPrototypeOf(left) && FixedIntegerType.isPrototypeOf(right)) {
					infer(expression, greaterDomain);
					return [greaterDomain, s2];
				}
				else {
					throw new TypeError(`The operator "·" is not defined for operands of type "${left}" and "${right}".`);
				}
			}
			else if (expression instanceof Divide) {
				if (FixedIntegerType.isPrototypeOf(left) && FixedIntegerType.isPrototypeOf(right)) {
					infer(expression, greaterDomain);
					return [greaterDomain, s2];
				}
				else {
					throw new TypeError(`The operator "/" is not defined for operands of type "${left}" and "${right}".`);
				}
			}
			else if (expression instanceof Power) {
				if (FixedIntegerType.isPrototypeOf(left)) {
					infer(expression, left);
					return [left, s2];
				}
				else {
					throw new TypeError(`The operator "**" is not defined for operands of type "${left}" and "${right}".`);
				}
			}
		}
		if (expression instanceof UnaryOperator) {
			if (expression instanceof Not) {
				const [operandType, s1] = typeOf(expression.operand);
				if (operandType !== BoolType) {
					throw new TypeError(`The operator "¬" is not defined for operands of type "${operandType}".`);
				}
				else {
					return [BoolType, s1];
				}
			}
		}
	}
	else if (expression instanceof Value) {
		if (expression instanceof NumberValue) {
			if (expression instanceof IntValue) {
				if (expression instanceof Int8Value) {
					infer(expression, Int8Type);
					return [Int8Type, store];
				}
				if (expression instanceof Int16Value) {
					infer(expression, Int16Type);
					return [Int16Type, store];
				}
				if (expression instanceof Int32Value) {
					infer(expression, Int32Type);
					return [Int32Type, store];
				}
			}
			if (expression instanceof UintValue) {
				if (expression instanceof Uint8Value) {
					infer(expression, Uint8Type);
					return [Uint8Type, store];
				}
				if (expression instanceof Int16Value) {
					infer(expression, Uint16Type);
					return [Uint16Type, store];
				}
				if (expression instanceof Int32Value) {
					infer(expression, Uint32Type);
					return [Uint32Type, store];
				}
			}
		}
		if (expression instanceof StringValue) {
			infer(expression, StringType);
			return [StringType, store];
		}
		if (expression instanceof BoolValue) {
			infer(expression, BoolType);
			return [BoolType, store];
		}
	}
	if (expression instanceof FunctionExpression) {
		const { parameters, body } = expression;
		let domain;
		if (!parameters.length) {
			domain = [VoidType];
		}
		else {
			domain = parameters.map(() => AnyType);
		}
		const newEnv = new Environment(environment);
		for (const { name } of parameters) {
			const location = newEnv.set(name, store.nextLocation);
			store.set(location, AnyType);
		}
		const [image] = typeOf(body, newEnv);
		const type = new FunctionType(domain, image);
		infer(expression, type);
		return [type, store];
	}
	else if (expression instanceof Apply) {
		const { target, args } = expression;
		const [type, s1] = typeOf(target);
		function checkArguments(domain, image) {
			let currentStore = s1;
			let applyType = image;
			if (!args.length) {
				const isVoidFunction = domain.length === 1 && domain[0] === VoidType;
				/* No arguments were specified. Is this legal? */
				if (!isVoidFunction) {
					/* Nope, it's not. */
					throw new TypeError(`Tried to invoke "${target.image || "closure"}" without any arguments, although at least one formal parameter is expected.`);
				}
			}
			args.forEach((arg, i) => {
				const [argumentType, s2] = typeOf(arg, environment, currentStore);
				let expectedType = domain[i];
				if (!expectedType) {
					/* Parameter must be somewhere in image! */
					let node = type;
					let currentIndex = 0;
					while (true) {
						const { domain, image } = node;
						if (domain) {
							/* Can we even find the index in this node? */
							if (i > currentIndex + domain.length - 1) {
								/* No, go to next node */
								currentIndex += domain.length;
								node = image;
								continue;
							}
							else {
								expectedType = domain[currentIndex - i];
								break;
							}
						}
						else {
							throw new Error(`More arguments specified than formal parameters available in invocation of "${target.image || "closure"}"`);
						}
					}
				}
				currentStore = s2;
				if (valueMatchesType(arg, expectedType, environment)) {
					infer(arg, argumentType);
					/* Are we the last argument?
					* `image.image` miraculously fixes the case:
					* ```chi
					* let curry2 = (x, y) => x + y
					* curry2(5, 8)
					* ```
					*/
					if (i === args.length - 1 && image.image) {
						/* Yes: Therefore, we can infer the `Apply` type from the image */
						for (let i = 0; i < args.length - 1; ++i) {
							applyType = applyType.image;
						}
					}
				}
				else {
					throw new TypeError(`Argument "${arg}" of type "${argumentType}" doesn't match expected type "${expectedType}" in invocation of "${target.name || "closure"}"`);
				}
			});
			return [applyType, currentStore];
		}
		if (type instanceof FunctionType) {
			const { domain, image } = type;
			const isVoidFunction = domain.length === 1 && domain[0] === VoidType;
			if (!args.length) {
				if (isVoidFunction) {
					infer(expression, image);
					return [image, s1];
				}
				else {
					throw new TypeError(`Tried to invoke "${target.image || "closure"}" without any arguments`);
				}
			}
			else {
				if (isVoidFunction) {
					const [actualType] = typeOf(target);
					throw new TypeError(`Tried to pass ${args.length} more argument${args.length === 1 ? "" : "s"} to "${target.image || "closure"}" of type "${actualType}" although none were expected`);
				}
				else {
					const [applyType, currentStore] = checkArguments(domain, image);
					if (args.length < domain.length) {
						const restDomain = domain.slice(args.length);
						const type = new FunctionType(restDomain, image);
						infer(expression, type);
						return [type, currentStore];
					}
					else {
						infer(expression, applyType);
						return [applyType, currentStore];
					}
				}
			}
		}
		else if (type instanceof RecursiveType) {
			const { typeHint } = type.identifier;
			const resultType = typeHint.image;
			const [newType, newStore] = checkArguments(typeHint.domain, typeHint.image);
			if (!expression.typeHint) {
				/* TODO: Can this happen? */
				warn("Yes, it can happen!");
				infer(expression, resultType);
			}
			return [newType, newStore];
		}
		else {
			throw new TypeError(`Unable to invoke "${target.image || "intermediate value"}", as it is of type "${type}".`);
		}
	}
	else if (expression instanceof Id) {
		const { name } = expression;
		if (!environment.has(name)) {
			throw new ReferenceError(name);
		}
		else {
			const location = environment.get(name);
			infer(expression, store.get(location));
			return [store.get(location), store];
		}
	}
	else if (expression instanceof Cast) {
		const { target, to: targetType } = expression;
		/* If the targetType is a real type, we can infer the type early */
		if (targetType !== UintType && targetType !== IntType) {
			expression.to = targetType;
		}
		const [sourceType, s1] = typeOf(target);
		if (targetType === sourceType) {
			infer(expression, targetType);
			return [targetType, s1];
		}
		else {
			if (FixedIntegerType.isPrototypeOf(sourceType) && FixedIntegerType.isPrototypeOf(targetType)) {
				let returnType = targetType;
				if (targetType === UintType) {
					/* `u?` should be statically cast to a real type first */
					returnType = sourceType.makeUnsigned();
				}
				else if (targetType === IntType) {
					/* `i?` should be statically cast to a real type first */
					returnType = sourceType.makeSigned();
				}
				expression.to = returnType;
				/* Allow dynamic casting for integers */
				infer(expression, returnType);
				return [returnType, s1];
			}
			if (sourceType === StringType && FixedIntegerType.isPrototypeOf(targetType)) {
				let returnType = targetType;
				if (targetType === UintType) {
					returnType = Uint32Type;
				}
				else if (targetType === IntType) {
					returnType = Int32Type;
				}
				infer(expression, returnType);
				expression.to = returnType;
				return [returnType, s1];
			}
			if (sourceType == StringType && FixedIntegerType.isPrototypeOf(targetType)) {
				infer(expression, targetType);
				return [targetType, s1];
			}
			else {
				throw new TypeError(`Can not cast "${sourceType}" to "${targetType}"`);
			}
		}
	}
	err(expression);
	throw new TypeError(`Unable to determine type of ${expression}`);
};
export default getTypeOf;