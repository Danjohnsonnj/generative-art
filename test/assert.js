function describe(value) {
  if (typeof value === "string") {
    return `"${value}"`;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function fail(message) {
  throw new Error(message);
}

function equal(actual, expected, message) {
  if (!Object.is(actual, expected)) {
    fail(message ?? `Expected ${describe(actual)} to equal ${describe(expected)}`);
  }
}

function ok(value, message) {
  if (!value) {
    fail(message ?? `Expected ${describe(value)} to be truthy`);
  }
}

function throws(fn, expected, message) {
  let thrownError;

  try {
    fn();
  } catch (error) {
    thrownError = error;
  }

  if (!thrownError) {
    fail(message ?? "Expected function to throw");
  }

  if (expected instanceof RegExp && !expected.test(String(thrownError.message))) {
    fail(message ?? `Expected error message to match ${expected}`);
  }

  if (typeof expected === "string" && !String(thrownError.message).includes(expected)) {
    fail(message ?? `Expected error message to include "${expected}"`);
  }

  if (
    typeof expected === "function" &&
    !(thrownError instanceof expected)
  ) {
    fail(message ?? `Expected error to be an instance of ${expected.name}`);
  }

  return thrownError;
}

export const assert = Object.freeze({ equal, ok, throws });
