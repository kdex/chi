import run from "../language/index.mjs";
import { err } from "print-log";
import { readFileSync } from "fs";
const [, , ...args] = process.argv;
if (!args.length) {
	err("No input file specified. Aborting.");
}
else {
	const [firstArgument] = args;
	try {
		const source = readFileSync(firstArgument, "utf-8");
		run(source);
	}
	catch (e) {
		err(e);
		process.exit(1);
	}
}