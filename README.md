# chi

[![travis](https://travis-ci.org/kdex/chi.svg?branch=master)](https://travis-ci.org/kdex/chi)
[![dependencies](https://david-dm.org/kdex/chi/status.svg)](https://david-dm.org/kdex/chi)

<p align="center">
  <img alt="logo" src="https://cloud.githubusercontent.com/assets/4442505/23861535/a7285cf6-080a-11e7-885d-f51787e4c6bb.png">
</p>
In order to try it out, run:

```bash
$ npm i
$ node dist/cli <chi-file>
```
This will tokenize the file `<chi-file>` and then parse, type-check and interpret it.

**Please do not use chi in production yet. It's still highly experimental and will likely change a lot.**
## About chi
Chi, in its current form, is a meant to be a statically-typed, imperative programming language featuring ideas from the functional programming paradigm. As such, it considers functions to be first-class and performs automatic currying. It uses static scope and supports Unicode tokens. A (potentially incomplete) showcase of features is listed in the next section. Again, note that some features may break or change as chi isn't stable yet.
## Demo
There is a very simple demo [here](https://github.kdex.de/chi/) where you can play around with chi.
## Getting started
### Variables
Variables allow you to bind a value to a name. Note that there is no significant whitespace and semicolons are *optional*.
```js
let a = 3;
let b = 5
```
### Types
Chi supports static typing. If no type is specified, a type will be inferred. Mathematical operations where the operands are of different numeric type will produce a result in the number type with the greater domain. The set of types currently consists of:
- `i8`
- `i16`
- `i32`
- `u8`
- `u16`
- `u32`
- `string`
- `bool`

### Numbers, type casting
There are currently the signed integer types `i8`, `i16`, and `i32` and their unsigned equivalents `u8`, `u16`, and `u32` for numerical values. If you don't specify the type of an integer literal, it will be assumed to be of type `i32`. In the example below, the first line will be `255:i8 + 2:i16`, which is equivalent to `-1:i8 + 2:i16`, which is equivalent to `-1:i16 + 2:i16`, which will be evaluated to `1:i16`.

The second line demonstrates that `1 + 128:i8` is equivalent to `1:i32 + 128:i8`, and will by the same rules be evaluated to `-127:i32`.
```js
255:i8 + 2:i16;
1 + 128:i8;
```
You can also perform *cast chaining* as demonstrated below. This will result in `2258274`, a 32-bit integer, being cast to a 16-bit integer which will then be casted to an 8-bit integer. (This is equivalent to casting the 32-bit integer to an 8-bit integer directly, but there are indeed use cases where casting a value multiple times can turn out to be beneficial.)
```js
2258274:i16:i8
```
You can also cast entire expressions:
```js
let a = 1024;
(a:i8 + a):i16;
```
### Strings
A string literal can be constructed using *double quotes*. The operator `+` is overloaded to handle string concatenation if both operands are strings. Mixing types will throw an error. `"` can be escaped within a string using `\"`.
```js
let p = "hello"
let q = " world"
p + q
```
### Function expressions
Function expressions allow you to abstract your code over variables. Note that in chi, you don't need an explicit `return` statement, as blocks evaluate to their last expression. So, in the example, `sum1` and `sum2` are semantically equivalent.
```js
let identity = x => x
let identity2 = (x) => x
let sum1 = (a, b) => a + b
let sum2 = (a, b) => {
	let sum = a + b
	sum
}
```
### Automatic currying
In chi, you *don't* need to explicitly return a lambda function that closes over a certain environment. Instead, if whatever a function returns doesn't have enough parameters bound in the environment, it becomes a closure. This means, `curry1` (which either returns a *closure* for *one* argument, or a *value* for *two* arguments) and `curry2` (which behaves exactly the same) can be used *interchangeably*.
```js
let curry1 = x => y => x + y
let curry2 = (x, y) => x + y
curry1(5, 8)
curry2(5, 8)
curry1(5)(8)
curry2(5)(8)
```
### Arity checking
If you try to invoke a function with more arguments than it can receive, this can be detected due to static type checking and throw a `TypeError`.
```js
let f = (x, y) => x * y - 3
f(1, 2, 3)
```
### Unicode tokens
Chi also allows certain tokens to have alternative forms. For example, the `MINUS` token can either be `Hyphen-minus`, `En Dash` or `Em Dash` (`-`, `–` and `—` respectively). Further examples how this can benefit esthetics can be seen below.
```js
let y = (x, y) => 2¹⁰ · x² – y⁴
let formula = true ∧ false ∨ true
```