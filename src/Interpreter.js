import { log, err, debug } from "print-log";
import { ReferenceError, BindError } from "./Error";
import getTypeOf from "./TypeSystem";
import {
	Environment,
	Store,
	Value,
	Operator,
	BinaryOperator,
	UnaryOperator,
	Add,
	Subtract,
	Multiply,
	Divide,
	Power,
	Let,
	Number,
	String,
	Int,
	Int8,
	Int16,
	Int32,
	Closure,
	Block,
	Id,
	Function,
	Apply,
	True,
	False,
	Boolean,
	And,
	Or,
	Not,
	Cast
} from "./InterpreterClasses";
import { TypeInt8, TypeInt16, TypeInt32 } from "./TypeSystem";
function coerceBoolean(value) {
	if (value instanceof Number) {
		if (value.value === 0) {
			return new False();
		}
		else {
			return new True();
		}
	}
}
export default function interpret(expression, environment = new Environment(), store = new Store()) {
	const π = (expression, env = environment, s = store) => interpret(expression, env, s);
	const typeOf = (expression, env = environment, s = store) => getTypeOf(expression, env, s);
	if (expression instanceof Value) {
		return [expression, store];
	}
	else if (expression instanceof Block) {
		const { content } = expression;
		let result, s = store;
		for (const expression of content) {
			const [value, newStore] = π(expression, environment, s);
			result = value;
			s = newStore;
		}
		return [result, s];
	}
	else if (expression instanceof Operator) {
		if (expression instanceof BinaryOperator) {
			if (expression instanceof And) {
				let [left, s1] = π(expression.left);
				let [right, s2] = π(expression.right, environment, s1);
				if (!(left instanceof Boolean)) {
					left = coerceBoolean(left);
				}
				if (!(right instanceof Boolean)) {
					right = coerceBoolean(right);
				}
// 				if (!(left instanceof Boolean) || !(right instanceof Boolean)) {
// 					throw new TypeError("Can only and booleans");
// 				}
				const [{ value: leftValue }, { value: rightValue }] = [left, right];
				let result;
				if (left instanceof False || right instanceof False) {
					result = new False();
				}
				else {
					result = new True();
				}
				return [result, s1];
			}
			else if (expression instanceof Or) {
				const [left, s1] = π(expression.left);
				const [right, s2] = π(expression.right, environment, s1);
				if (!(left instanceof Boolean) || !(right instanceof Boolean)) {
					throw new TypeError("Can only and booleans");
				}
				const [{ value: leftValue }, { value: rightValue }] = [left, right];
				let result;
				if (left instanceof True || right instanceof True) {
					result = new True();
				}
				else {
					result = new False();
				}
				return [result, s1];
			}
			else if (expression instanceof Add) {
				const [left, s1] = π(expression.left);
				const [right, s2] = π(expression.right, environment, s1);
				if (left instanceof String && right instanceof String) {
					return [left.concatenate(right), s2];
				}
				if (left instanceof Int && right instanceof Int) {
					const leftInt8 = left instanceof Int8;
					const rightInt8 = right instanceof Int8;
					const leftInt16 = left instanceof Int16;
					const rightInt16 = right instanceof Int16;
					const leftInt32 = left instanceof Int32;
					const rightInt32 = right instanceof Int32;
					/* Casting Int8 */
					if (leftInt8 && rightInt8) {
						return [left.add(right), s2];
					}
					else if (leftInt8 && !rightInt8) {
						return [right.add(left.to(typeOf(right))), s2];
					}
					else if (!leftInt8 && rightInt8) {
						return [left.add(right.to(typeOf(left))), s2];
					}
					/* Casting Int16 */
					else if (leftInt16 && rightInt16) {
						return [left.add(right), s2];
					}
					else if (leftInt16 && !rightInt16) {
						return [right.add(left.to(TypeInt16)), s2];
					}
					else if (!leftInt16 && rightInt16) {
						return [left.add(right.to(TypeInt16)), s2];
					}
					/* Casting Int32 */
					else if (leftInt32 && rightInt32) {
						return [left.add(right), s2];
					}
					else if (leftInt32 && !rightInt32) {
						return [left.add(right.to(TypeInt32)), s2];
					}
					else if (!leftInt32 && rightInt32) {
						return [right.add(left.to(TypeInt32)), s2];
					}
					else {
						throw new Error("Add: Not implemented yet");
					}
				}
				else {
					throw new TypeError(`The operator "+" can only be used for two strings or two numbers.`);
				}
			}
			else if (expression instanceof Subtract) {
				const [left, s1] = π(expression.left);
				const [right, s2] = π(expression.right, environment, s1);
				if (!(left instanceof Number) || !(right instanceof Number)) {
					throw new TypeError("Can only subtract numbers");
				}
				return [new Number(null, left.value - right.value), s2];
			}
			else if (expression instanceof Multiply) {
				const [left, s1] = π(expression.left);
				const [right, s2] = π(expression.right, environment, s1);
				if (!(left instanceof Number) || !(right instanceof Number)) {
					throw new TypeError();
				}
				const [{ value: leftValue }, { value: rightValue }] = [left, right];
				return [new Number(null, leftValue * rightValue), s2];
			}
			else if (expression instanceof Divide) {
				const [left, s1] = π(expression.left);
				const [right, s2] = π(expression.right, environment, s1);
				if (!(left instanceof Number) || !(right instanceof Number)) {
					throw new TypeError();
				}
				const [{ value: leftValue }, { value: rightValue }] = [left, right];
				return [new Number(null, leftValue / rightValue), s2];
			}
			else if (expression instanceof Power) {
				const [left, s1] = π(expression.left);
				const [right, s2] = π(expression.right, environment, s1);
				if (!(left instanceof Number) || !(right instanceof Number)) {
					throw new TypeError();
				}
				const [{ value: leftValue }, { value: rightValue }] = [left, right];
				return [new Number(null, leftValue ** rightValue), s2];
			}
		}
		else if (expression instanceof UnaryOperator) {
			if (expression instanceof Not) {
				const [value, s1] = π(expression.operand);
				if (!(value instanceof Boolean)) {
					throw new TypeError("Can only negate booleans");
				}
				let result;
				if (value instanceof False) {
					result = new True();
				}
				else {
					result = new False();
				}
				return [result, s1];
			}
		}
	}
	else if (expression instanceof Function) {
		const { parameters, body } = expression;
		return [new Closure(parameters, body, environment), store];
	}
	else if (expression instanceof Apply) {
		const { target, args } = expression;
		const [funV, funStore] = π(target);
		let argStore = funStore;
		/* Evaluate the argument list first */
		const argArray = [];
		for (const arg of args) {
			const [argV, newArgStore] = π(arg, environment, argStore);
			argStore = newArgStore;
			argArray.push([arg, [argV, argStore]]);
		}
		if (!(funV instanceof Closure)) {
			throw new TypeError(`Can not invoke "${funV.value}", as it is of type "${funV.constructor.name}"`);
		}
		else {
			const { parameters, body, environment, originalArity } = funV;
			/* Extend the environment and the store */
			const newEnvironment = new Environment(environment);
// 			const argMap = new Map(argArray);
			function getBindings() {
				return parameters
					.map(p => ({
						[p.name]: newEnvironment.has(p.name)
					}))
					.reduce((x, y) => Object.assign(x, y), {});
			}
			function isAllBound() {
				const allBound = Object.values(getBindings()).every(p => p);
				/* Let's just return a new closure! */
				return allBound;
			}
			let i = 0;
			for (const parameter of parameters) {
				const { name } = parameter;
				const newLocation = store.nextLocation;
				const [, [value]] = argArray[i];
				newEnvironment.set(name, newLocation);
				argStore.set(newLocation, value);
				const isBindingComplete = isAllBound();
				const isLastFormalParameter = i === originalArity - 1;
				const isLastProvidedParameter = i === args.length - 1;
				if (isLastFormalParameter && !isLastProvidedParameter) {
					/* The user called this function with too many parameters */
					throw new BindError(args, originalArity);
				}
				else if (!isLastFormalParameter && isLastProvidedParameter && !isAllBound()) {
					/*
					* Note that `isLastFormalParameter` and `i` don't play nice together.
					* We must use `isAllBound` above to check if the entire context is bound.
					* We don't have enough arguments to evaluate; let's just return a new closure.
					*/
					const bindings = getBindings();
					const closure = new Closure(parameters.filter(p => !bindings[p.name]), body, newEnvironment, originalArity);
					return [closure, argStore];
				}
				++i;
			}
			/* We have enough arguments now, so let's evaluate. */
			return π(body, newEnvironment, argStore);
		}
	}
	else if (expression instanceof Let) {
		const { identifier, expression: boundExpression } = expression;
		const { name } = identifier;
		const [value, s1] = π(boundExpression);
		const newStore = new Store(s1);
		const location = environment.set(name, newStore.nextLocation);
		newStore.set(location, value);
		return [value, newStore];
	}
	else if (expression instanceof Id) {
		const { name } = expression;
		const location = environment.get(name);
		return [store.get(location), store];
	}
	else if (expression instanceof Cast) {
		const { target, to: type } = expression;
		const [value, s1] = π(target);
		if (value instanceof Value) {
			return [value.to(type), s1];
		}
		else {
			throw new Error("Not implemented");
		}
	}
	else {
		debug(`"Interpreter error: ${expression.constructor.name}" not implemented:`, expression);
		process.exit(1);
	}
}