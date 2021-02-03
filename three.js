// threejs.org/license
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.THREE = {}));
}(this, (function (exports) { 'use strict';

	// Polyfills
	if (Number.EPSILON === undefined) {
		Number.EPSILON = Math.pow(2, -52);
	}

	if (Number.isInteger === undefined) {
		// Missing in IE
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
		Number.isInteger = function (value) {
			return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
		};
	} //


	if (Math.sign === undefined) {
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
		Math.sign = function (x) {
			return x < 0 ? -1 : x > 0 ? 1 : +x;
		};
	}

	if ('name' in Function.prototype === false) {
		// Missing in IE
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
		Object.defineProperty(Function.prototype, 'name', {
			get: function get() {
				return this.toString().match(/^\s*function\s*([^\(\s]*)/)[1];
			}
		});
	}

	if (Object.assign === undefined) {
		// Missing in IE
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
		Object.assign = function (target) {

			if (target === undefined || target === null) {
				throw new TypeError('Cannot convert undefined or null to object');
			}

			var output = Object(target);

			for (var index = 1; index < arguments.length; index++) {
				var source = arguments[index];

				if (source !== undefined && source !== null) {
					for (var nextKey in source) {
						if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
							output[nextKey] = source[nextKey];
						}
					}
				}
			}

			return output;
		};
	}

	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	var runtime = function (exports) {

		var Op = Object.prototype;
		var hasOwn = Op.hasOwnProperty;
		var undefined$1; // More compressible than void 0.

		var $Symbol = typeof Symbol === "function" ? Symbol : {};
		var iteratorSymbol = $Symbol.iterator || "@@iterator";
		var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
		var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

		function define(obj, key, value) {
			Object.defineProperty(obj, key, {
				value: value,
				enumerable: true,
				configurable: true,
				writable: true
			});
			return obj[key];
		}

		try {
			// IE 8 has a broken Object.defineProperty that only works on DOM objects.
			define({}, "");
		} catch (err) {
			define = function define(obj, key, value) {
				return obj[key] = value;
			};
		}

		function wrap(innerFn, outerFn, self, tryLocsList) {
			// If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
			var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
			var generator = Object.create(protoGenerator.prototype);
			var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
			// .throw, and .return methods.

			generator._invoke = makeInvokeMethod(innerFn, self, context);
			return generator;
		}

		exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
		// record like context.tryEntries[i].completion. This interface could
		// have been (and was previously) designed to take a closure to be
		// invoked without arguments, but in all the cases we care about we
		// already have an existing method we want to call, so there's no need
		// to create a new function object. We can even get away with assuming
		// the method takes exactly one argument, since that happens to be true
		// in every case, so we don't have to touch the arguments object. The
		// only additional allocation required is the completion record, which
		// has a stable shape and so hopefully should be cheap to allocate.

		function tryCatch(fn, obj, arg) {
			try {
				return {
					type: "normal",
					arg: fn.call(obj, arg)
				};
			} catch (err) {
				return {
					type: "throw",
					arg: err
				};
			}
		}

		var GenStateSuspendedStart = "suspendedStart";
		var GenStateSuspendedYield = "suspendedYield";
		var GenStateExecuting = "executing";
		var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
		// breaking out of the dispatch switch statement.

		var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
		// .constructor.prototype properties for functions that return Generator
		// objects. For full spec compliance, you may wish to configure your
		// minifier not to mangle the names of these two functions.

		function Generator() {}

		function GeneratorFunction() {}

		function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
		// don't natively support it.


		var IteratorPrototype = {};

		IteratorPrototype[iteratorSymbol] = function () {
			return this;
		};

		var getProto = Object.getPrototypeOf;
		var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

		if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
			// This environment has a native %IteratorPrototype%; use it instead
			// of the polyfill.
			IteratorPrototype = NativeIteratorPrototype;
		}

		var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
		GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
		GeneratorFunctionPrototype.constructor = GeneratorFunction;
		GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
		// Iterator interface in terms of a single ._invoke method.

		function defineIteratorMethods(prototype) {
			["next", "throw", "return"].forEach(function (method) {
				define(prototype, method, function (arg) {
					return this._invoke(method, arg);
				});
			});
		}

		exports.isGeneratorFunction = function (genFun) {
			var ctor = typeof genFun === "function" && genFun.constructor;
			return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
			// do is to check its .name property.
			(ctor.displayName || ctor.name) === "GeneratorFunction" : false;
		};

		exports.mark = function (genFun) {
			if (Object.setPrototypeOf) {
				Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
			} else {
				genFun.__proto__ = GeneratorFunctionPrototype;
				define(genFun, toStringTagSymbol, "GeneratorFunction");
			}

			genFun.prototype = Object.create(Gp);
			return genFun;
		}; // Within the body of any async function, `await x` is transformed to
		// `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
		// `hasOwn.call(value, "__await")` to determine if the yielded value is
		// meant to be awaited.


		exports.awrap = function (arg) {
			return {
				__await: arg
			};
		};

		function AsyncIterator(generator, PromiseImpl) {
			function invoke(method, arg, resolve, reject) {
				var record = tryCatch(generator[method], generator, arg);

				if (record.type === "throw") {
					reject(record.arg);
				} else {
					var result = record.arg;
					var value = result.value;

					if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
						return PromiseImpl.resolve(value.__await).then(function (value) {
							invoke("next", value, resolve, reject);
						}, function (err) {
							invoke("throw", err, resolve, reject);
						});
					}

					return PromiseImpl.resolve(value).then(function (unwrapped) {
						// When a yielded Promise is resolved, its final value becomes
						// the .value of the Promise<{value,done}> result for the
						// current iteration.
						result.value = unwrapped;
						resolve(result);
					}, function (error) {
						// If a rejected Promise was yielded, throw the rejection back
						// into the async generator function so it can be handled there.
						return invoke("throw", error, resolve, reject);
					});
				}
			}

			var previousPromise;

			function enqueue(method, arg) {
				function callInvokeWithMethodAndArg() {
					return new PromiseImpl(function (resolve, reject) {
						invoke(method, arg, resolve, reject);
					});
				}

				return previousPromise = // If enqueue has been called before, then we want to wait until
				// all previous Promises have been resolved before calling invoke,
				// so that results are always delivered in the correct order. If
				// enqueue has not been called before, then it is important to
				// call invoke immediately, without waiting on a callback to fire,
				// so that the async generator function has the opportunity to do
				// any necessary setup in a predictable way. This predictability
				// is why the Promise constructor synchronously invokes its
				// executor callback, and why async functions synchronously
				// execute code before the first await. Since we implement simple
				// async functions in terms of async generators, it is especially
				// important to get this right, even though it requires care.
				previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
				// invocations of the iterator.
				callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
			} // Define the unified helper method that is used to implement .next,
			// .throw, and .return (see defineIteratorMethods).


			this._invoke = enqueue;
		}

		defineIteratorMethods(AsyncIterator.prototype);

		AsyncIterator.prototype[asyncIteratorSymbol] = function () {
			return this;
		};

		exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
		// AsyncIterator objects; they just return a Promise for the value of
		// the final result produced by the iterator.

		exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
			if (PromiseImpl === void 0) PromiseImpl = Promise;
			var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
			return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
			: iter.next().then(function (result) {
				return result.done ? result.value : iter.next();
			});
		};

		function makeInvokeMethod(innerFn, self, context) {
			var state = GenStateSuspendedStart;
			return function invoke(method, arg) {
				if (state === GenStateExecuting) {
					throw new Error("Generator is already running");
				}

				if (state === GenStateCompleted) {
					if (method === "throw") {
						throw arg;
					} // Be forgiving, per 25.3.3.3.3 of the spec:
					// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


					return doneResult();
				}

				context.method = method;
				context.arg = arg;

				while (true) {
					var delegate = context.delegate;

					if (delegate) {
						var delegateResult = maybeInvokeDelegate(delegate, context);

						if (delegateResult) {
							if (delegateResult === ContinueSentinel) continue;
							return delegateResult;
						}
					}

					if (context.method === "next") {
						// Setting context._sent for legacy support of Babel's
						// function.sent implementation.
						context.sent = context._sent = context.arg;
					} else if (context.method === "throw") {
						if (state === GenStateSuspendedStart) {
							state = GenStateCompleted;
							throw context.arg;
						}

						context.dispatchException(context.arg);
					} else if (context.method === "return") {
						context.abrupt("return", context.arg);
					}

					state = GenStateExecuting;
					var record = tryCatch(innerFn, self, context);

					if (record.type === "normal") {
						// If an exception is thrown from innerFn, we leave state ===
						// GenStateExecuting and loop back for another invocation.
						state = context.done ? GenStateCompleted : GenStateSuspendedYield;

						if (record.arg === ContinueSentinel) {
							continue;
						}

						return {
							value: record.arg,
							done: context.done
						};
					} else if (record.type === "throw") {
						state = GenStateCompleted; // Dispatch the exception by looping back around to the
						// context.dispatchException(context.arg) call above.

						context.method = "throw";
						context.arg = record.arg;
					}
				}
			};
		} // Call delegate.iterator[context.method](context.arg) and handle the
		// result, either by returning a { value, done } result from the
		// delegate iterator, or by modifying context.method and context.arg,
		// setting context.delegate to null, and returning the ContinueSentinel.


		function maybeInvokeDelegate(delegate, context) {
			var method = delegate.iterator[context.method];

			if (method === undefined$1) {
				// A .throw or .return when the delegate iterator has no .throw
				// method always terminates the yield* loop.
				context.delegate = null;

				if (context.method === "throw") {
					// Note: ["return"] must be used for ES3 parsing compatibility.
					if (delegate.iterator["return"]) {
						// If the delegate iterator has a return method, give it a
						// chance to clean up.
						context.method = "return";
						context.arg = undefined$1;
						maybeInvokeDelegate(delegate, context);

						if (context.method === "throw") {
							// If maybeInvokeDelegate(context) changed context.method from
							// "return" to "throw", let that override the TypeError below.
							return ContinueSentinel;
						}
					}

					context.method = "throw";
					context.arg = new TypeError("The iterator does not provide a 'throw' method");
				}

				return ContinueSentinel;
			}

			var record = tryCatch(method, delegate.iterator, context.arg);

			if (record.type === "throw") {
				context.method = "throw";
				context.arg = record.arg;
				context.delegate = null;
				return ContinueSentinel;
			}

			var info = record.arg;

			if (!info) {
				context.method = "throw";
				context.arg = new TypeError("iterator result is not an object");
				context.delegate = null;
				return ContinueSentinel;
			}

			if (info.done) {
				// Assign the result of the finished delegate to the temporary
				// variable specified by delegate.resultName (see delegateYield).
				context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

				context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
				// exception, let the outer generator proceed normally. If
				// context.method was "next", forget context.arg since it has been
				// "consumed" by the delegate iterator. If context.method was
				// "return", allow the original .return call to continue in the
				// outer generator.

				if (context.method !== "return") {
					context.method = "next";
					context.arg = undefined$1;
				}
			} else {
				// Re-yield the result returned by the delegate method.
				return info;
			} // The delegate iterator is finished, so forget it and continue with
			// the outer generator.


			context.delegate = null;
			return ContinueSentinel;
		} // Define Generator.prototype.{next,throw,return} in terms of the
		// unified ._invoke helper method.


		defineIteratorMethods(Gp);
		define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
		// @@iterator function is called on it. Some browsers' implementations of the
		// iterator prototype chain incorrectly implement this, causing the Generator
		// object to not be returned from this call. This ensures that doesn't happen.
		// See https://github.com/facebook/regenerator/issues/274 for more details.

		Gp[iteratorSymbol] = function () {
			return this;
		};

		Gp.toString = function () {
			return "[object Generator]";
		};

		function pushTryEntry(locs) {
			var entry = {
				tryLoc: locs[0]
			};

			if (1 in locs) {
				entry.catchLoc = locs[1];
			}

			if (2 in locs) {
				entry.finallyLoc = locs[2];
				entry.afterLoc = locs[3];
			}

			this.tryEntries.push(entry);
		}

		function resetTryEntry(entry) {
			var record = entry.completion || {};
			record.type = "normal";
			delete record.arg;
			entry.completion = record;
		}

		function Context(tryLocsList) {
			// The root entry object (effectively a try statement without a catch
			// or a finally block) gives us a place to store values thrown from
			// locations where there is no enclosing try statement.
			this.tryEntries = [{
				tryLoc: "root"
			}];
			tryLocsList.forEach(pushTryEntry, this);
			this.reset(true);
		}

		exports.keys = function (object) {
			var keys = [];

			for (var key in object) {
				keys.push(key);
			}

			keys.reverse(); // Rather than returning an object with a next method, we keep
			// things simple and return the next function itself.

			return function next() {
				while (keys.length) {
					var key = keys.pop();

					if (key in object) {
						next.value = key;
						next.done = false;
						return next;
					}
				} // To avoid creating an additional object, we just hang the .value
				// and .done properties off the next function object itself. This
				// also ensures that the minifier will not anonymize the function.


				next.done = true;
				return next;
			};
		};

		function values(iterable) {
			if (iterable) {
				var iteratorMethod = iterable[iteratorSymbol];

				if (iteratorMethod) {
					return iteratorMethod.call(iterable);
				}

				if (typeof iterable.next === "function") {
					return iterable;
				}

				if (!isNaN(iterable.length)) {
					var i = -1,
							next = function next() {
						while (++i < iterable.length) {
							if (hasOwn.call(iterable, i)) {
								next.value = iterable[i];
								next.done = false;
								return next;
							}
						}

						next.value = undefined$1;
						next.done = true;
						return next;
					};

					return next.next = next;
				}
			} // Return an iterator with no values.


			return {
				next: doneResult
			};
		}

		exports.values = values;

		function doneResult() {
			return {
				value: undefined$1,
				done: true
			};
		}

		Context.prototype = {
			constructor: Context,
			reset: function reset(skipTempReset) {
				this.prev = 0;
				this.next = 0; // Resetting context._sent for legacy support of Babel's
				// function.sent implementation.

				this.sent = this._sent = undefined$1;
				this.done = false;
				this.delegate = null;
				this.method = "next";
				this.arg = undefined$1;
				this.tryEntries.forEach(resetTryEntry);

				if (!skipTempReset) {
					for (var name in this) {
						// Not sure about the optimal order of these conditions:
						if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
							this[name] = undefined$1;
						}
					}
				}
			},
			stop: function stop() {
				this.done = true;
				var rootEntry = this.tryEntries[0];
				var rootRecord = rootEntry.completion;

				if (rootRecord.type === "throw") {
					throw rootRecord.arg;
				}

				return this.rval;
			},
			dispatchException: function dispatchException(exception) {
				if (this.done) {
					throw exception;
				}

				var context = this;

				function handle(loc, caught) {
					record.type = "throw";
					record.arg = exception;
					context.next = loc;

					if (caught) {
						// If the dispatched exception was caught by a catch block,
						// then let that catch block handle the exception normally.
						context.method = "next";
						context.arg = undefined$1;
					}

					return !!caught;
				}

				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];
					var record = entry.completion;

					if (entry.tryLoc === "root") {
						// Exception thrown outside of any try block that could handle
						// it, so set the completion value of the entire function to
						// throw the exception.
						return handle("end");
					}

					if (entry.tryLoc <= this.prev) {
						var hasCatch = hasOwn.call(entry, "catchLoc");
						var hasFinally = hasOwn.call(entry, "finallyLoc");

						if (hasCatch && hasFinally) {
							if (this.prev < entry.catchLoc) {
								return handle(entry.catchLoc, true);
							} else if (this.prev < entry.finallyLoc) {
								return handle(entry.finallyLoc);
							}
						} else if (hasCatch) {
							if (this.prev < entry.catchLoc) {
								return handle(entry.catchLoc, true);
							}
						} else if (hasFinally) {
							if (this.prev < entry.finallyLoc) {
								return handle(entry.finallyLoc);
							}
						} else {
							throw new Error("try statement without catch or finally");
						}
					}
				}
			},
			abrupt: function abrupt(type, arg) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];

					if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
						var finallyEntry = entry;
						break;
					}
				}

				if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
					// Ignore the finally entry if control is not jumping to a
					// location outside the try/catch block.
					finallyEntry = null;
				}

				var record = finallyEntry ? finallyEntry.completion : {};
				record.type = type;
				record.arg = arg;

				if (finallyEntry) {
					this.method = "next";
					this.next = finallyEntry.finallyLoc;
					return ContinueSentinel;
				}

				return this.complete(record);
			},
			complete: function complete(record, afterLoc) {
				if (record.type === "throw") {
					throw record.arg;
				}

				if (record.type === "break" || record.type === "continue") {
					this.next = record.arg;
				} else if (record.type === "return") {
					this.rval = this.arg = record.arg;
					this.method = "return";
					this.next = "end";
				} else if (record.type === "normal" && afterLoc) {
					this.next = afterLoc;
				}

				return ContinueSentinel;
			},
			finish: function finish(finallyLoc) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];

					if (entry.finallyLoc === finallyLoc) {
						this.complete(entry.completion, entry.afterLoc);
						resetTryEntry(entry);
						return ContinueSentinel;
					}
				}
			},
			"catch": function _catch(tryLoc) {
				for (var i = this.tryEntries.length - 1; i >= 0; --i) {
					var entry = this.tryEntries[i];

					if (entry.tryLoc === tryLoc) {
						var record = entry.completion;

						if (record.type === "throw") {
							var thrown = record.arg;
							resetTryEntry(entry);
						}

						return thrown;
					}
				} // The context.catch method must only be called with a location
				// argument that corresponds to a known catch block.


				throw new Error("illegal catch attempt");
			},
			delegateYield: function delegateYield(iterable, resultName, nextLoc) {
				this.delegate = {
					iterator: values(iterable),
					resultName: resultName,
					nextLoc: nextLoc
				};

				if (this.method === "next") {
					// Deliberately forget the last sent value so that we don't
					// accidentally pass it on to the delegate.
					this.arg = undefined$1;
				}

				return ContinueSentinel;
			}
		}; // Regardless of whether this script is executing as a CommonJS module
		// or not, return the runtime object so that we can declare the variable
		// regeneratorRuntime in the outer scope, which allows this module to be
		// injected easily by `bin/regenerator --include-runtime script.js`.

		return exports;
	}( // If this script is executing as a CommonJS module, use module.exports
	// as the regeneratorRuntime namespace. Otherwise create a new empty
	// object. Either way, the resulting object will be used to initialize
	// the regeneratorRuntime variable at the top of this file.
	typeof module === "object" ? module.exports : {});

	try {
		regeneratorRuntime = runtime;
	} catch (accidentalStrictMode) {
		// This module should not be running in strict mode, so the above
		// assignment should always work unless something is misconfigured. Just
		// in case runtime.js accidentally runs in strict mode, we can escape
		// strict mode using a global Function call. This could conceivably fail
		// if a Content Security Policy forbids using Function, but in that case
		// the proper solution is to fix the accidental strict mode problem. If
		// you've misconfigured your bundler to force strict mode and applied a
		// CSP to forbid Function, and you're not willing to fix either of those
		// problems, please detail your unique predicament in a GitHub issue.
		Function("r", "regeneratorRuntime = r")(runtime);
	}

	var REVISION = '125';
	var MOUSE = {
		LEFT: 0,
		MIDDLE: 1,
		RIGHT: 2,
		ROTATE: 0,
		DOLLY: 1,
		PAN: 2
	};
	var TOUCH = {
		ROTATE: 0,
		PAN: 1,
		DOLLY_PAN: 2,
		DOLLY_ROTATE: 3
	};
	var CullFaceNone = 0;
	var CullFaceBack = 1;
	var CullFaceFront = 2;
	var CullFaceFrontBack = 3;
	var BasicShadowMap = 0;
	var PCFShadowMap = 1;
	var PCFSoftShadowMap = 2;
	var VSMShadowMap = 3;
	var FrontSide = 0;
	var BackSide = 1;
	var DoubleSide = 2;
	var FlatShading = 1;
	var SmoothShading = 2;
	var NoBlending = 0;
	var NormalBlending = 1;
	var AdditiveBlending = 2;
	var SubtractiveBlending = 3;
	var MultiplyBlending = 4;
	var CustomBlending = 5;
	var AddEquation = 100;
	var SubtractEquation = 101;
	var ReverseSubtractEquation = 102;
	var MinEquation = 103;
	var MaxEquation = 104;
	var ZeroFactor = 200;
	var OneFactor = 201;
	var SrcColorFactor = 202;
	var OneMinusSrcColorFactor = 203;
	var SrcAlphaFactor = 204;
	var OneMinusSrcAlphaFactor = 205;
	var DstAlphaFactor = 206;
	var OneMinusDstAlphaFactor = 207;
	var DstColorFactor = 208;
	var OneMinusDstColorFactor = 209;
	var SrcAlphaSaturateFactor = 210;
	var NeverDepth = 0;
	var AlwaysDepth = 1;
	var LessDepth = 2;
	var LessEqualDepth = 3;
	var EqualDepth = 4;
	var GreaterEqualDepth = 5;
	var GreaterDepth = 6;
	var NotEqualDepth = 7;
	var MultiplyOperation = 0;
	var MixOperation = 1;
	var AddOperation = 2;
	var NoToneMapping = 0;
	var LinearToneMapping = 1;
	var ReinhardToneMapping = 2;
	var CineonToneMapping = 3;
	var ACESFilmicToneMapping = 4;
	var CustomToneMapping = 5;
	var UVMapping = 300;
	var CubeReflectionMapping = 301;
	var CubeRefractionMapping = 302;
	var EquirectangularReflectionMapping = 303;
	var EquirectangularRefractionMapping = 304;
	var CubeUVReflectionMapping = 306;
	var CubeUVRefractionMapping = 307;
	var RepeatWrapping = 1000;
	var ClampToEdgeWrapping = 1001;
	var MirroredRepeatWrapping = 1002;
	var NearestFilter = 1003;
	var NearestMipmapNearestFilter = 1004;
	var NearestMipMapNearestFilter = 1004;
	var NearestMipmapLinearFilter = 1005;
	var NearestMipMapLinearFilter = 1005;
	var LinearFilter = 1006;
	var LinearMipmapNearestFilter = 1007;
	var LinearMipMapNearestFilter = 1007;
	var LinearMipmapLinearFilter = 1008;
	var LinearMipMapLinearFilter = 1008;
	var UnsignedByteType = 1009;
	var ByteType = 1010;
	var ShortType = 1011;
	var UnsignedShortType = 1012;
	var IntType = 1013;
	var UnsignedIntType = 1014;
	var FloatType = 1015;
	var HalfFloatType = 1016;
	var UnsignedShort4444Type = 1017;
	var UnsignedShort5551Type = 1018;
	var UnsignedShort565Type = 1019;
	var UnsignedInt248Type = 1020;
	var AlphaFormat = 1021;
	var RGBFormat = 1022;
	var RGBAFormat = 1023;
	var LuminanceFormat = 1024;
	var LuminanceAlphaFormat = 1025;
	var RGBEFormat = RGBAFormat;
	var DepthFormat = 1026;
	var DepthStencilFormat = 1027;
	var RedFormat = 1028;
	var RedIntegerFormat = 1029;
	var RGFormat = 1030;
	var RGIntegerFormat = 1031;
	var RGBIntegerFormat = 1032;
	var RGBAIntegerFormat = 1033;
	var RGB_S3TC_DXT1_Format = 33776;
	var RGBA_S3TC_DXT1_Format = 33777;
	var RGBA_S3TC_DXT3_Format = 33778;
	var RGBA_S3TC_DXT5_Format = 33779;
	var RGB_PVRTC_4BPPV1_Format = 35840;
	var RGB_PVRTC_2BPPV1_Format = 35841;
	var RGBA_PVRTC_4BPPV1_Format = 35842;
	var RGBA_PVRTC_2BPPV1_Format = 35843;
	var RGB_ETC1_Format = 36196;
	var RGB_ETC2_Format = 37492;
	var RGBA_ETC2_EAC_Format = 37496;
	var RGBA_ASTC_4x4_Format = 37808;
	var RGBA_ASTC_5x4_Format = 37809;
	var RGBA_ASTC_5x5_Format = 37810;
	var RGBA_ASTC_6x5_Format = 37811;
	var RGBA_ASTC_6x6_Format = 37812;
	var RGBA_ASTC_8x5_Format = 37813;
	var RGBA_ASTC_8x6_Format = 37814;
	var RGBA_ASTC_8x8_Format = 37815;
	var RGBA_ASTC_10x5_Format = 37816;
	var RGBA_ASTC_10x6_Format = 37817;
	var RGBA_ASTC_10x8_Format = 37818;
	var RGBA_ASTC_10x10_Format = 37819;
	var RGBA_ASTC_12x10_Format = 37820;
	var RGBA_ASTC_12x12_Format = 37821;
	var RGBA_BPTC_Format = 36492;
	var SRGB8_ALPHA8_ASTC_4x4_Format = 37840;
	var SRGB8_ALPHA8_ASTC_5x4_Format = 37841;
	var SRGB8_ALPHA8_ASTC_5x5_Format = 37842;
	var SRGB8_ALPHA8_ASTC_6x5_Format = 37843;
	var SRGB8_ALPHA8_ASTC_6x6_Format = 37844;
	var SRGB8_ALPHA8_ASTC_8x5_Format = 37845;
	var SRGB8_ALPHA8_ASTC_8x6_Format = 37846;
	var SRGB8_ALPHA8_ASTC_8x8_Format = 37847;
	var SRGB8_ALPHA8_ASTC_10x5_Format = 37848;
	var SRGB8_ALPHA8_ASTC_10x6_Format = 37849;
	var SRGB8_ALPHA8_ASTC_10x8_Format = 37850;
	var SRGB8_ALPHA8_ASTC_10x10_Format = 37851;
	var SRGB8_ALPHA8_ASTC_12x10_Format = 37852;
	var SRGB8_ALPHA8_ASTC_12x12_Format = 37853;
	var LoopOnce = 2200;
	var LoopRepeat = 2201;
	var LoopPingPong = 2202;
	var InterpolateDiscrete = 2300;
	var InterpolateLinear = 2301;
	var InterpolateSmooth = 2302;
	var ZeroCurvatureEnding = 2400;
	var ZeroSlopeEnding = 2401;
	var WrapAroundEnding = 2402;
	var NormalAnimationBlendMode = 2500;
	var AdditiveAnimationBlendMode = 2501;
	var TrianglesDrawMode = 0;
	var TriangleStripDrawMode = 1;
	var TriangleFanDrawMode = 2;
	var LinearEncoding = 3000;
	var sRGBEncoding = 3001;
	var GammaEncoding = 3007;
	var RGBEEncoding = 3002;
	var LogLuvEncoding = 3003;
	var RGBM7Encoding = 3004;
	var RGBM16Encoding = 3005;
	var RGBDEncoding = 3006;
	var BasicDepthPacking = 3200;
	var RGBADepthPacking = 3201;
	var TangentSpaceNormalMap = 0;
	var ObjectSpaceNormalMap = 1;
	var ZeroStencilOp = 0;
	var KeepStencilOp = 7680;
	var ReplaceStencilOp = 7681;
	var IncrementStencilOp = 7682;
	var DecrementStencilOp = 7683;
	var IncrementWrapStencilOp = 34055;
	var DecrementWrapStencilOp = 34056;
	var InvertStencilOp = 5386;
	var NeverStencilFunc = 512;
	var LessStencilFunc = 513;
	var EqualStencilFunc = 514;
	var LessEqualStencilFunc = 515;
	var GreaterStencilFunc = 516;
	var NotEqualStencilFunc = 517;
	var GreaterEqualStencilFunc = 518;
	var AlwaysStencilFunc = 519;
	var StaticDrawUsage = 35044;
	var DynamicDrawUsage = 35048;
	var StreamDrawUsage = 35040;
	var StaticReadUsage = 35045;
	var DynamicReadUsage = 35049;
	var StreamReadUsage = 35041;
	var StaticCopyUsage = 35046;
	var DynamicCopyUsage = 35050;
	var StreamCopyUsage = 35042;
	var GLSL1 = '100';
	var GLSL3 = '300 es';

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
		try {
			var info = gen[key](arg);
			var value = info.value;
		} catch (error) {
			reject(error);
			return;
		}

		if (info.done) {
			resolve(value);
		} else {
			Promise.resolve(value).then(_next, _throw);
		}
	}

	function _asyncToGenerator(fn) {
		return function () {
			var self = this,
					args = arguments;
			return new Promise(function (resolve, reject) {
				var gen = fn.apply(self, args);

				function _next(value) {
					asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
				}

				function _throw(err) {
					asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
				}

				_next(undefined);
			});
		};
	}

	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		return Constructor;
	}

	function _inheritsLoose(subClass, superClass) {
		subClass.prototype = Object.create(superClass.prototype);
		subClass.prototype.constructor = subClass;
		subClass.__proto__ = superClass;
	}

	function _assertThisInitialized(self) {
		if (self === void 0) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return self;
	}

	function _unsupportedIterableToArray(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
		if (len == null || len > arr.length) len = arr.length;

		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

		return arr2;
	}

	function _createForOfIteratorHelperLoose(o, allowArrayLike) {
		var it;

		if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
			if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
				if (it) o = it;
				var i = 0;
				return function () {
					if (i >= o.length) return {
						done: true
					};
					return {
						done: false,
						value: o[i++]
					};
				};
			}

			throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
		}

		it = o[Symbol.iterator]();
		return it.next.bind(it);
	}

	/**
	 * https://github.com/mrdoob/eventdispatcher.js/
	 */
	function EventDispatcher() {}

	Object.assign(EventDispatcher.prototype, {
		addEventListener: function addEventListener(type, listener) {
			if (this._listeners === undefined) this._listeners = {};
			var listeners = this._listeners;

			if (listeners[type] === undefined) {
				listeners[type] = [];
			}

			if (listeners[type].indexOf(listener) === -1) {
				listeners[type].push(listener);
			}
		},
		hasEventListener: function hasEventListener(type, listener) {
			if (this._listeners === undefined) return false;
			var listeners = this._listeners;
			return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1;
		},
		removeEventListener: function removeEventListener(type, listener) {
			if (this._listeners === undefined) return;
			var listeners = this._listeners;
			var listenerArray = listeners[type];

			if (listenerArray !== undefined) {
				var index = listenerArray.indexOf(listener);

				if (index !== -1) {
					listenerArray.splice(index, 1);
				}
			}
		},
		dispatchEvent: function dispatchEvent(event) {
			if (this._listeners === undefined) return;
			var listeners = this._listeners;
			var listenerArray = listeners[event.type];

			if (listenerArray !== undefined) {
				event.target = this; // Make a copy, in case listeners are removed while iterating.

				var array = listenerArray.slice(0);

				for (var i = 0, l = array.length; i < l; i++) {
					array[i].call(this, event);
				}
			}
		}
	});

	var _lut = [];

	for (var i = 0; i < 256; i++) {
		_lut[i] = (i < 16 ? '0' : '') + i.toString(16);
	}

	var _seed = 1234567;
	var MathUtils = {
		DEG2RAD: Math.PI / 180,
		RAD2DEG: 180 / Math.PI,
		generateUUID: function generateUUID() {
			// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
			var d0 = Math.random() * 0xffffffff | 0;
			var d1 = Math.random() * 0xffffffff | 0;
			var d2 = Math.random() * 0xffffffff | 0;
			var d3 = Math.random() * 0xffffffff | 0;
			var uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' + _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' + _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] + _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff]; // .toUpperCase() here flattens concatenated strings to save heap memory space.

			return uuid.toUpperCase();
		},
		clamp: function clamp(value, min, max) {
			return Math.max(min, Math.min(max, value));
		},
		// compute euclidian modulo of m % n
		// https://en.wikipedia.org/wiki/Modulo_operation
		euclideanModulo: function euclideanModulo(n, m) {
			return (n % m + m) % m;
		},
		// Linear mapping from range <a1, a2> to range <b1, b2>
		mapLinear: function mapLinear(x, a1, a2, b1, b2) {
			return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
		},
		// https://en.wikipedia.org/wiki/Linear_interpolation
		lerp: function lerp(x, y, t) {
			return (1 - t) * x + t * y;
		},
		// http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
		damp: function damp(x, y, lambda, dt) {
			return MathUtils.lerp(x, y, 1 - Math.exp(-lambda * dt));
		},
		// https://www.desmos.com/calculator/vcsjnyz7x4
		pingpong: function pingpong(x, length) {
			if (length === void 0) {
				length = 1;
			}

			return length - Math.abs(MathUtils.euclideanModulo(x, length * 2) - length);
		},
		// http://en.wikipedia.org/wiki/Smoothstep
		smoothstep: function smoothstep(x, min, max) {
			if (x <= min) return 0;
			if (x >= max) return 1;
			x = (x - min) / (max - min);
			return x * x * (3 - 2 * x);
		},
		smootherstep: function smootherstep(x, min, max) {
			if (x <= min) return 0;
			if (x >= max) return 1;
			x = (x - min) / (max - min);
			return x * x * x * (x * (x * 6 - 15) + 10);
		},
		// Random integer from <low, high> interval
		randInt: function randInt(low, high) {
			return low + Math.floor(Math.random() * (high - low + 1));
		},
		// Random float from <low, high> interval
		randFloat: function randFloat(low, high) {
			return low + Math.random() * (high - low);
		},
		// Random float from <-range/2, range/2> interval
		randFloatSpread: function randFloatSpread(range) {
			return range * (0.5 - Math.random());
		},
		// Deterministic pseudo-random float in the interval [ 0, 1 ]
		seededRandom: function seededRandom(s) {
			if (s !== undefined) _seed = s % 2147483647; // Park-Miller algorithm

			_seed = _seed * 16807 % 2147483647;
			return (_seed - 1) / 2147483646;
		},
		degToRad: function degToRad(degrees) {
			return degrees * MathUtils.DEG2RAD;
		},
		radToDeg: function radToDeg(radians) {
			return radians * MathUtils.RAD2DEG;
		},
		isPowerOfTwo: function isPowerOfTwo(value) {
			return (value & value - 1) === 0 && value !== 0;
		},
		ceilPowerOfTwo: function ceilPowerOfTwo(value) {
			return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
		},
		floorPowerOfTwo: function floorPowerOfTwo(value) {
			return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
		},
		setQuaternionFromProperEuler: function setQuaternionFromProperEuler(q, a, b, c, order) {
			// Intrinsic Proper Euler Angles - see https://en.wikipedia.org/wiki/Euler_angles
			// rotations are applied to the axes in the order specified by 'order'
			// rotation by angle 'a' is applied first, then by angle 'b', then by angle 'c'
			// angles are in radians
			var cos = Math.cos;
			var sin = Math.sin;
			var c2 = cos(b / 2);
			var s2 = sin(b / 2);
			var c13 = cos((a + c) / 2);
			var s13 = sin((a + c) / 2);
			var c1_3 = cos((a - c) / 2);
			var s1_3 = sin((a - c) / 2);
			var c3_1 = cos((c - a) / 2);
			var s3_1 = sin((c - a) / 2);

			switch (order) {
				case 'XYX':
					q.set(c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13);
					break;

				case 'YZY':
					q.set(s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13);
					break;

				case 'ZXZ':
					q.set(s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13);
					break;

				case 'XZX':
					q.set(c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13);
					break;

				case 'YXY':
					q.set(s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13);
					break;

				case 'ZYZ':
					q.set(s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13);
					break;

				default:
					console.warn('THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: ' + order);
			}
		}
	};

	var Vector2 = /*#__PURE__*/function () {
		function Vector2(x, y) {
			if (x === void 0) {
				x = 0;
			}

			if (y === void 0) {
				y = 0;
			}

			Object.defineProperty(this, 'isVector2', {
				value: true
			});
			this.x = x;
			this.y = y;
		}

		var _proto = Vector2.prototype;

		_proto.set = function set(x, y) {
			this.x = x;
			this.y = y;
			return this;
		};

		_proto.setScalar = function setScalar(scalar) {
			this.x = scalar;
			this.y = scalar;
			return this;
		};

		_proto.setX = function setX(x) {
			this.x = x;
			return this;
		};

		_proto.setY = function setY(y) {
			this.y = y;
			return this;
		};

		_proto.setComponent = function setComponent(index, value) {
			switch (index) {
				case 0:
					this.x = value;
					break;

				case 1:
					this.y = value;
					break;

				default:
					throw new Error('index is out of range: ' + index);
			}

			return this;
		};

		_proto.getComponent = function getComponent(index) {
			switch (index) {
				case 0:
					return this.x;

				case 1:
					return this.y;

				default:
					throw new Error('index is out of range: ' + index);
			}
		};

		_proto.clone = function clone() {
			return new this.constructor(this.x, this.y);
		};

		_proto.copy = function copy(v) {
			this.x = v.x;
			this.y = v.y;
			return this;
		};

		_proto.add = function add(v, w) {
			if (w !== undefined) {
				console.warn('THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
				return this.addVectors(v, w);
			}

			this.x += v.x;
			this.y += v.y;
			return this;
		};

		_proto.addScalar = function addScalar(s) {
			this.x += s;
			this.y += s;
			return this;
		};

		_proto.addVectors = function addVectors(a, b) {
			this.x = a.x + b.x;
			this.y = a.y + b.y;
			return this;
		};

		_proto.addScaledVector = function addScaledVector(v, s) {
			this.x += v.x * s;
			this.y += v.y * s;
			return this;
		};

		_proto.sub = function sub(v, w) {
			if (w !== undefined) {
				console.warn('THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
				return this.subVectors(v, w);
			}

			this.x -= v.x;
			this.y -= v.y;
			return this;
		};

		_proto.subScalar = function subScalar(s) {
			this.x -= s;
			this.y -= s;
			return this;
		};

		_proto.subVectors = function subVectors(a, b) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			return this;
		};

		_proto.multiply = function multiply(v) {
			this.x *= v.x;
			this.y *= v.y;
			return this;
		};

		_proto.multiplyScalar = function multiplyScalar(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			return this;
		};

		_proto.divide = function divide(v) {
			this.x /= v.x;
			this.y /= v.y;
			return this;
		};

		_proto.divideScalar = function divideScalar(scalar) {
			return this.multiplyScalar(1 / scalar);
		};

		_proto.applyMatrix3 = function applyMatrix3(m) {
			var x = this.x,
					y = this.y;
			var e = m.elements;
			this.x = e[0] * x + e[3] * y + e[6];
			this.y = e[1] * x + e[4] * y + e[7];
			return this;
		};

		_proto.min = function min(v) {
			this.x = Math.min(this.x, v.x);
			this.y = Math.min(this.y, v.y);
			return this;
		};

		_proto.max = function max(v) {
			this.x = Math.max(this.x, v.x);
			this.y = Math.max(this.y, v.y);
			return this;
		};

		_proto.clamp = function clamp(min, max) {
			// assumes min < max, componentwise
			this.x = Math.max(min.x, Math.min(max.x, this.x));
			this.y = Math.max(min.y, Math.min(max.y, this.y));
			return this;
		};

		_proto.clampScalar = function clampScalar(minVal, maxVal) {
			this.x = Math.max(minVal, Math.min(maxVal, this.x));
			this.y = Math.max(minVal, Math.min(maxVal, this.y));
			return this;
		};

		_proto.clampLength = function clampLength(min, max) {
			var length = this.length();
			return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
		};

		_proto.floor = function floor() {
			this.x = Math.floor(this.x);
			this.y = Math.floor(this.y);
			return this;
		};

		_proto.ceil = function ceil() {
			this.x = Math.ceil(this.x);
			this.y = Math.ceil(this.y);
			return this;
		};

		_proto.round = function round() {
			this.x = Math.round(this.x);
			this.y = Math.round(this.y);
			return this;
		};

		_proto.roundToZero = function roundToZero() {
			this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
			this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
			return this;
		};

		_proto.negate = function negate() {
			this.x = -this.x;
			this.y = -this.y;
			return this;
		};

		_proto.dot = function dot(v) {
			return this.x * v.x + this.y * v.y;
		};

		_proto.cross = function cross(v) {
			return this.x * v.y - this.y * v.x;
		};

		_proto.lengthSq = function lengthSq() {
			return this.x * this.x + this.y * this.y;
		};

		_proto.length = function length() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		};

		_proto.manhattanLength = function manhattanLength() {
			return Math.abs(this.x) + Math.abs(this.y);
		};

		_proto.normalize = function normalize() {
			return this.divideScalar(this.length() || 1);
		};

		_proto.angle = function angle() {
			// computes the angle in radians with respect to the positive x-axis
			var angle = Math.atan2(-this.y, -this.x) + Math.PI;
			return angle;
		};

		_proto.distanceTo = function distanceTo(v) {
			return Math.sqrt(this.distanceToSquared(v));
		};

		_proto.distanceToSquared = function distanceToSquared(v) {
			var dx = this.x - v.x,
					dy = this.y - v.y;
			return dx * dx + dy * dy;
		};

		_proto.manhattanDistanceTo = function manhattanDistanceTo(v) {
			return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
		};

		_proto.setLength = function setLength(length) {
			return this.normalize().multiplyScalar(length);
		};

		_proto.lerp = function lerp(v, alpha) {
			this.x += (v.x - this.x) * alpha;
			this.y += (v.y - this.y) * alpha;
			return this;
		};

		_proto.lerpVectors = function lerpVectors(v1, v2, alpha) {
			this.x = v1.x + (v2.x - v1.x) * alpha;
			this.y = v1.y + (v2.y - v1.y) * alpha;
			return this;
		};

		_proto.equals = function equals(v) {
			return v.x === this.x && v.y === this.y;
		};

		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}

			this.x = array[offset];
			this.y = array[offset + 1];
			return this;
		};

		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}

			if (offset === void 0) {
				offset = 0;
			}

			array[offset] = this.x;
			array[offset + 1] = this.y;
			return array;
		};

		_proto.fromBufferAttribute = function fromBufferAttribute(attribute, index, offset) {
			if (offset !== undefined) {
				console.warn('THREE.Vector2: offset has been removed from .fromBufferAttribute().');
			}

			this.x = attribute.getX(index);
			this.y = attribute.getY(index);
			return this;
		};

		_proto.rotateAround = function rotateAround(center, angle) {
			var c = Math.cos(angle),
					s = Math.sin(angle);
			var x = this.x - center.x;
			var y = this.y - center.y;
			this.x = x * c - y * s + center.x;
			this.y = x * s + y * c + center.y;
			return this;
		};

		_proto.random = function random() {
			this.x = Math.random();
			this.y = Math.random();
			return this;
		};

		_createClass(Vector2, [{
			key: "width",
			get: function get() {
				return this.x;
			},
			set: function set(value) {
				this.x = value;
			}
		}, {
			key: "height",
			get: function get() {
				return this.y;
			},
			set: function set(value) {
				this.y = value;
			}
		}]);

		return Vector2;
	}();

	var Matrix3 = /*#__PURE__*/function () {
		function Matrix3() {
			Object.defineProperty(this, 'isMatrix3', {
				value: true
			});
			this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1];

			if (arguments.length > 0) {
				console.error('THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.');
			}
		}

		var _proto = Matrix3.prototype;

		_proto.set = function set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
			var te = this.elements;
			te[0] = n11;
			te[1] = n21;
			te[2] = n31;
			te[3] = n12;
			te[4] = n22;
			te[5] = n32;
			te[6] = n13;
			te[7] = n23;
			te[8] = n33;
			return this;
		};

		_proto.identity = function identity() {
			this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
			return this;
		};

		_proto.clone = function clone() {
			return new this.constructor().fromArray(this.elements);
		};

		_proto.copy = function copy(m) {
			var te = this.elements;
			var me = m.elements;
			te[0] = me[0];
			te[1] = me[1];
			te[2] = me[2];
			te[3] = me[3];
			te[4] = me[4];
			te[5] = me[5];
			te[6] = me[6];
			te[7] = me[7];
			te[8] = me[8];
			return this;
		};

		_proto.extractBasis = function extractBasis(xAxis, yAxis, zAxis) {
			xAxis.setFromMatrix3Column(this, 0);
			yAxis.setFromMatrix3Column(this, 1);
			zAxis.setFromMatrix3Column(this, 2);
			return this;
		};

		_proto.setFromMatrix4 = function setFromMatrix4(m) {
			var me = m.elements;
			this.set(me[0], me[4], me[8], me[1], me[5], me[9], me[2], me[6], me[10]);
			return this;
		};

		_proto.multiply = function multiply(m) {
			return this.multiplyMatrices(this, m);
		};

		_proto.premultiply = function premultiply(m) {
			return this.multiplyMatrices(m, this);
		};

		_proto.multiplyMatrices = function multiplyMatrices(a, b) {
			var ae = a.elements;
			var be = b.elements;
			var te = this.elements;
			var a11 = ae[0],
					a12 = ae[3],
					a13 = ae[6];
			var a21 = ae[1],
					a22 = ae[4],
					a23 = ae[7];
			var a31 = ae[2],
					a32 = ae[5],
					a33 = ae[8];
			var b11 = be[0],
					b12 = be[3],
					b13 = be[6];
			var b21 = be[1],
					b22 = be[4],
					b23 = be[7];
			var b31 = be[2],
					b32 = be[5],
					b33 = be[8];
			te[0] = a11 * b11 + a12 * b21 + a13 * b31;
			te[3] = a11 * b12 + a12 * b22 + a13 * b32;
			te[6] = a11 * b13 + a12 * b23 + a13 * b33;
			te[1] = a21 * b11 + a22 * b21 + a23 * b31;
			te[4] = a21 * b12 + a22 * b22 + a23 * b32;
			te[7] = a21 * b13 + a22 * b23 + a23 * b33;
			te[2] = a31 * b11 + a32 * b21 + a33 * b31;
			te[5] = a31 * b12 + a32 * b22 + a33 * b32;
			te[8] = a31 * b13 + a32 * b23 + a33 * b33;
			return this;
		};

		_proto.multiplyScalar = function multiplyScalar(s) {
			var te = this.elements;
			te[0] *= s;
			te[3] *= s;
			te[6] *= s;
			te[1] *= s;
			te[4] *= s;
			te[7] *= s;
			te[2] *= s;
			te[5] *= s;
			te[8] *= s;
			return this;
		};

		_proto.determinant = function determinant() {
			var te = this.elements;
			var a = te[0],
					b = te[1],
					c = te[2],
					d = te[3],
					e = te[4],
					f = te[5],
					g = te[6],
					h = te[7],
					i = te[8];
			return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
		};

		_proto.invert = function invert() {
			var te = this.elements,
					n11 = te[0],
					n21 = te[1],
					n31 = te[2],
					n12 = te[3],
					n22 = te[4],
					n32 = te[5],
					n13 = te[6],
					n23 = te[7],
					n33 = te[8],
					t11 = n33 * n22 - n32 * n23,
					t12 = n32 * n13 - n33 * n12,
					t13 = n23 * n12 - n22 * n13,
					det = n11 * t11 + n21 * t12 + n31 * t13;
			if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
			var detInv = 1 / det;
			te[0] = t11 * detInv;
			te[1] = (n31 * n23 - n33 * n21) * detInv;
			te[2] = (n32 * n21 - n31 * n22) * detInv;
			te[3] = t12 * detInv;
			te[4] = (n33 * n11 - n31 * n13) * detInv;
			te[5] = (n31 * n12 - n32 * n11) * detInv;
			te[6] = t13 * detInv;
			te[7] = (n21 * n13 - n23 * n11) * detInv;
			te[8] = (n22 * n11 - n21 * n12) * detInv;
			return this;
		};

		_proto.transpose = function transpose() {
			var tmp;
			var m = this.elements;
			tmp = m[1];
			m[1] = m[3];
			m[3] = tmp;
			tmp = m[2];
			m[2] = m[6];
			m[6] = tmp;
			tmp = m[5];
			m[5] = m[7];
			m[7] = tmp;
			return this;
		};

		_proto.getNormalMatrix = function getNormalMatrix(matrix4) {
			return this.setFromMatrix4(matrix4).copy(this).invert().transpose();
		};

		_proto.transposeIntoArray = function transposeIntoArray(r) {
			var m = this.elements;
			r[0] = m[0];
			r[1] = m[3];
			r[2] = m[6];
			r[3] = m[1];
			r[4] = m[4];
			r[5] = m[7];
			r[6] = m[2];
			r[7] = m[5];
			r[8] = m[8];
			return this;
		};

		_proto.setUvTransform = function setUvTransform(tx, ty, sx, sy, rotation, cx, cy) {
			var c = Math.cos(rotation);
			var s = Math.sin(rotation);
			this.set(sx * c, sx * s, -sx * (c * cx + s * cy) + cx + tx, -sy * s, sy * c, -sy * (-s * cx + c * cy) + cy + ty, 0, 0, 1);
			return this;
		};

		_proto.scale = function scale(sx, sy) {
			var te = this.elements;
			te[0] *= sx;
			te[3] *= sx;
			te[6] *= sx;
			te[1] *= sy;
			te[4] *= sy;
			te[7] *= sy;
			return this;
		};

		_proto.rotate = function rotate(theta) {
			var c = Math.cos(theta);
			var s = Math.sin(theta);
			var te = this.elements;
			var a11 = te[0],
					a12 = te[3],
					a13 = te[6];
			var a21 = te[1],
					a22 = te[4],
					a23 = te[7];
			te[0] = c * a11 + s * a21;
			te[3] = c * a12 + s * a22;
			te[6] = c * a13 + s * a23;
			te[1] = -s * a11 + c * a21;
			te[4] = -s * a12 + c * a22;
			te[7] = -s * a13 + c * a23;
			return this;
		};

		_proto.translate = function translate(tx, ty) {
			var te = this.elements;
			te[0] += tx * te[2];
			te[3] += tx * te[5];
			te[6] += tx * te[8];
			te[1] += ty * te[2];
			te[4] += ty * te[5];
			te[7] += ty * te[8];
			return this;
		};

		_proto.equals = function equals(matrix) {
			var te = this.elements;
			var me = matrix.elements;

			for (var i = 0; i < 9; i++) {
				if (te[i] !== me[i]) return false;
			}

			return true;
		};

		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}

			for (var i = 0; i < 9; i++) {
				this.elements[i] = array[i + offset];
			}

			return this;
		};

		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}

			if (offset === void 0) {
				offset = 0;
			}

			var te = this.elements;
			array[offset] = te[0];
			array[offset + 1] = te[1];
			array[offset + 2] = te[2];
			array[offset + 3] = te[3];
			array[offset + 4] = te[4];
			array[offset + 5] = te[5];
			array[offset + 6] = te[6];
			array[offset + 7] = te[7];
			array[offset + 8] = te[8];
			return array;
		};

		return Matrix3;
	}();

	var _canvas;

	var ImageUtils = {
		getDataURL: function getDataURL(image) {
			if (/^data:/i.test(image.src)) {
				return image.src;
			}

			if (typeof HTMLCanvasElement == 'undefined') {
				return image.src;
			}

			var canvas;

			if (image instanceof HTMLCanvasElement) {
				canvas = image;
			} else {
				if (_canvas === undefined) _canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
				_canvas.width = image.width;
				_canvas.height = image.height;

				var context = _canvas.getContext('2d');

				if (image instanceof ImageData) {
					context.putImageData(image, 0, 0);
				} else {
					context.drawImage(image, 0, 0, image.width, image.height);
				}

				canvas = _canvas;
			}

			if (canvas.width > 2048 || canvas.height > 2048) {
				return canvas.toDataURL('image/jpeg', 0.6);
			} else {
				return canvas.toDataURL('image/png');
			}
		}
	};

	var textureId = 0;

	function Texture(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding) {
		if (image === void 0) {
			image = Texture.DEFAULT_IMAGE;
		}

		if (mapping === void 0) {
			mapping = Texture.DEFAULT_MAPPING;
		}

		if (wrapS === void 0) {
			wrapS = ClampToEdgeWrapping;
		}

		if (wrapT === void 0) {
			wrapT = ClampToEdgeWrapping;
		}

		if (magFilter === void 0) {
			magFilter = LinearFilter;
		}

		if (minFilter === void 0) {
			minFilter = LinearMipmapLinearFilter;
		}

		if (format === void 0) {
			format = RGBAFormat;
		}

		if (type === void 0) {
			type = UnsignedByteType;
		}

		if (anisotropy === void 0) {
			anisotropy = 1;
		}

		if (encoding === void 0) {
			encoding = LinearEncoding;
		}

		Object.defineProperty(this, 'id', {
			value: textureId++
		});
		this.uuid = MathUtils.generateUUID();
		this.name = '';
		this.image = image;
		this.mipmaps = [];
		this.mapping = mapping;
		this.wrapS = wrapS;
		this.wrapT = wrapT;
		this.magFilter = magFilter;
		this.minFilter = minFilter;
		this.anisotropy = anisotropy;
		this.format = format;
		this.internalFormat = null;
		this.type = type;
		this.offset = new Vector2(0, 0);
		this.repeat = new Vector2(1, 1);
		this.center = new Vector2(0, 0);
		this.rotation = 0;
		this.matrixAutoUpdate = true;
		this.matrix = new Matrix3();
		this.generateMipmaps = true;
		this.premultiplyAlpha = false;
		this.flipY = true;
		this.unpackAlignment = 4; // valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)
		// Values of encoding !== THREE.LinearEncoding only supported on map, envMap and emissiveMap.
		//
		// Also changing the encoding after already used by a Material will not automatically make the Material
		// update. You need to explicitly call Material.needsUpdate to trigger it to recompile.

		this.encoding = encoding;
		this.version = 0;
		this.onUpdate = null;
	}

	Texture.DEFAULT_IMAGE = undefined;
	Texture.DEFAULT_MAPPING = UVMapping;
	Texture.prototype = Object.assign(Object.create(EventDispatcher.prototype), {
		constructor: Texture,
		isTexture: true,
		updateMatrix: function updateMatrix() {
			this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
		},
		clone: function clone() {
			return new this.constructor().copy(this);
		},
		copy: function copy(source) {
			this.name = source.name;
			this.image = source.image;
			this.mipmaps = source.mipmaps.slice(0);
			this.mapping = source.mapping;
			this.wrapS = source.wrapS;
			this.wrapT = source.wrapT;
			this.magFilter = source.magFilter;
			this.minFilter = source.minFilter;
			this.anisotropy = source.anisotropy;
			this.format = source.format;
			this.internalFormat = source.internalFormat;
			this.type = source.type;
			this.offset.copy(source.offset);
			this.repeat.copy(source.repeat);
			this.center.copy(source.center);
			this.rotation = source.rotation;
			this.matrixAutoUpdate = source.matrixAutoUpdate;
			this.matrix.copy(source.matrix);
			this.generateMipmaps = source.generateMipmaps;
			this.premultiplyAlpha = source.premultiplyAlpha;
			this.flipY = source.flipY;
			this.unpackAlignment = source.unpackAlignment;
			this.encoding = source.encoding;
			return this;
		},
		toJSON: function toJSON(meta) {
			var isRootObject = meta === undefined || typeof meta === 'string';

			if (!isRootObject && meta.textures[this.uuid] !== undefined) {
				return meta.textures[this.uuid];
			}

			var output = {
				metadata: {
					version: 4.5,
					type: 'Texture',
					generator: 'Texture.toJSON'
				},
				uuid: this.uuid,
				name: this.name,
				mapping: this.mapping,
				repeat: [this.repeat.x, this.repeat.y],
				offset: [this.offset.x, this.offset.y],
				center: [this.center.x, this.center.y],
				rotation: this.rotation,
				wrap: [this.wrapS, this.wrapT],
				format: this.format,
				type: this.type,
				encoding: this.encoding,
				minFilter: this.minFilter,
				magFilter: this.magFilter,
				anisotropy: this.anisotropy,
				flipY: this.flipY,
				premultiplyAlpha: this.premultiplyAlpha,
				unpackAlignment: this.unpackAlignment
			};

			if (this.image !== undefined) {
				// TODO: Move to THREE.Image
				var image = this.image;

				if (image.uuid === undefined) {
					image.uuid = MathUtils.generateUUID(); // UGH
				}

				if (!isRootObject && meta.images[image.uuid] === undefined) {
					var url;

					if (Array.isArray(image)) {
						// process array of images e.g. CubeTexture
						url = [];

						for (var i = 0, l = image.length; i < l; i++) {
							// check cube texture with data textures
							if (image[i].isDataTexture) {
								url.push(serializeImage(image[i].image));
							} else {
								url.push(serializeImage(image[i]));
							}
						}
					} else {
						// process single image
						url = serializeImage(image);
					}

					meta.images[image.uuid] = {
						uuid: image.uuid,
						url: url
					};
				}

				output.image = image.uuid;
			}

			if (!isRootObject) {
				meta.textures[this.uuid] = output;
			}

			return output;
		},
		dispose: function dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		},
		transformUv: function transformUv(uv) {
			if (this.mapping !== UVMapping) return uv;
			uv.applyMatrix3(this.matrix);

			if (uv.x < 0 || uv.x > 1) {
				switch (this.wrapS) {
					case RepeatWrapping:
						uv.x = uv.x - Math.floor(uv.x);
						break;

					case ClampToEdgeWrapping:
						uv.x = uv.x < 0 ? 0 : 1;
						break;

					case MirroredRepeatWrapping:
						if (Math.abs(Math.floor(uv.x) % 2) === 1) {
							uv.x = Math.ceil(uv.x) - uv.x;
						} else {
							uv.x = uv.x - Math.floor(uv.x);
						}

						break;
				}
			}

			if (uv.y < 0 || uv.y > 1) {
				switch (this.wrapT) {
					case RepeatWrapping:
						uv.y = uv.y - Math.floor(uv.y);
						break;

					case ClampToEdgeWrapping:
						uv.y = uv.y < 0 ? 0 : 1;
						break;

					case MirroredRepeatWrapping:
						if (Math.abs(Math.floor(uv.y) % 2) === 1) {
							uv.y = Math.ceil(uv.y) - uv.y;
						} else {
							uv.y = uv.y - Math.floor(uv.y);
						}

						break;
				}
			}

			if (this.flipY) {
				uv.y = 1 - uv.y;
			}

			return uv;
		}
	});
	Object.defineProperty(Texture.prototype, 'needsUpdate', {
		set: function set(value) {
			if (value === true) this.version++;
		}
	});

	function serializeImage(image) {
		if (typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement || typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) {
			// default images
			return ImageUtils.getDataURL(image);
		} else {
			if (image.data) {
				// images of DataTexture
				return {
					data: Array.prototype.slice.call(image.data),
					width: image.width,
					height: image.height,
					type: image.data.constructor.name
				};
			} else {
				console.warn('THREE.Texture: Unable to serialize Texture.');
				return {};
			}
		}
	}

	var Vector4 = /*#__PURE__*/function () {
		function Vector4(x, y, z, w) {
			if (x === void 0) {
				x = 0;
			}

			if (y === void 0) {
				y = 0;
			}

			if (z === void 0) {
				z = 0;
			}

			if (w === void 0) {
				w = 1;
			}

			Object.defineProperty(this, 'isVector4', {
				value: true
			});
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
		}

		var _proto = Vector4.prototype;

		_proto.set = function set(x, y, z, w) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			return this;
		};

		_proto.setScalar = function setScalar(scalar) {
			this.x = scalar;
			this.y = scalar;
			this.z = scalar;
			this.w = scalar;
			return this;
		};

		_proto.setX = function setX(x) {
			this.x = x;
			return this;
		};

		_proto.setY = function setY(y) {
			this.y = y;
			return this;
		};

		_proto.setZ = function setZ(z) {
			this.z = z;
			return this;
		};

		_proto.setW = function setW(w) {
			this.w = w;
			return this;
		};

		_proto.setComponent = function setComponent(index, value) {
			switch (index) {
				case 0:
					this.x = value;
					break;

				case 1:
					this.y = value;
					break;

				case 2:
					this.z = value;
					break;

				case 3:
					this.w = value;
					break;

				default:
					throw new Error('index is out of range: ' + index);
			}

			return this;
		};

		_proto.getComponent = function getComponent(index) {
			switch (index) {
				case 0:
					return this.x;

				case 1:
					return this.y;

				case 2:
					return this.z;

				case 3:
					return this.w;

				default:
					throw new Error('index is out of range: ' + index);
			}
		};

		_proto.clone = function clone() {
			return new this.constructor(this.x, this.y, this.z, this.w);
		};

		_proto.copy = function copy(v) {
			this.x = v.x;
			this.y = v.y;
			this.z = v.z;
			this.w = v.w !== undefined ? v.w : 1;
			return this;
		};

		_proto.add = function add(v, w) {
			if (w !== undefined) {
				console.warn('THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
				return this.addVectors(v, w);
			}

			this.x += v.x;
			this.y += v.y;
			this.z += v.z;
			this.w += v.w;
			return this;
		};

		_proto.addScalar = function addScalar(s) {
			this.x += s;
			this.y += s;
			this.z += s;
			this.w += s;
			return this;
		};

		_proto.addVectors = function addVectors(a, b) {
			this.x = a.x + b.x;
			this.y = a.y + b.y;
			this.z = a.z + b.z;
			this.w = a.w + b.w;
			return this;
		};

		_proto.addScaledVector = function addScaledVector(v, s) {
			this.x += v.x * s;
			this.y += v.y * s;
			this.z += v.z * s;
			this.w += v.w * s;
			return this;
		};

		_proto.sub = function sub(v, w) {
			if (w !== undefined) {
				console.warn('THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
				return this.subVectors(v, w);
			}

			this.x -= v.x;
			this.y -= v.y;
			this.z -= v.z;
			this.w -= v.w;
			return this;
		};

		_proto.subScalar = function subScalar(s) {
			this.x -= s;
			this.y -= s;
			this.z -= s;
			this.w -= s;
			return this;
		};

		_proto.subVectors = function subVectors(a, b) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;
			this.w = a.w - b.w;
			return this;
		};

		_proto.multiply = function multiply(v) {
			this.x *= v.x;
			this.y *= v.y;
			this.z *= v.z;
			this.w *= v.w;
			return this;
		};

		_proto.multiplyScalar = function multiplyScalar(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			this.w *= scalar;
			return this;
		};

		_proto.applyMatrix4 = function applyMatrix4(m) {
			var x = this.x,
					y = this.y,
					z = this.z,
					w = this.w;
			var e = m.elements;
			this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
			this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
			this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
			this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
			return this;
		};

		_proto.divideScalar = function divideScalar(scalar) {
			return this.multiplyScalar(1 / scalar);
		};

		_proto.setAxisAngleFromQuaternion = function setAxisAngleFromQuaternion(q) {
			// http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm
			// q is assumed to be normalized
			this.w = 2 * Math.acos(q.w);
			var s = Math.sqrt(1 - q.w * q.w);

			if (s < 0.0001) {
				this.x = 1;
				this.y = 0;
				this.z = 0;
			} else {
				this.x = q.x / s;
				this.y = q.y / s;
				this.z = q.z / s;
			}

			return this;
		};

		_proto.setAxisAngleFromRotationMatrix = function setAxisAngleFromRotationMatrix(m) {
			// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToAngle/index.htm
			// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
			var angle, x, y, z; // variables for result

			var epsilon = 0.01,
					// margin to allow for rounding errors
			epsilon2 = 0.1,
					// margin to distinguish between 0 and 180 degrees
			te = m.elements,
					m11 = te[0],
					m12 = te[4],
					m13 = te[8],
					m21 = te[1],
					m22 = te[5],
					m23 = te[9],
					m31 = te[2],
					m32 = te[6],
					m33 = te[10];

			if (Math.abs(m12 - m21) < epsilon && Math.abs(m13 - m31) < epsilon && Math.abs(m23 - m32) < epsilon) {
				// singularity found
				// first check for identity matrix which must have +1 for all terms
				// in leading diagonal and zero in other terms
				if (Math.abs(m12 + m21) < epsilon2 && Math.abs(m13 + m31) < epsilon2 && Math.abs(m23 + m32) < epsilon2 && Math.abs(m11 + m22 + m33 - 3) < epsilon2) {
					// this singularity is identity matrix so angle = 0
					this.set(1, 0, 0, 0);
					return this; // zero angle, arbitrary axis
				} // otherwise this singularity is angle = 180


				angle = Math.PI;
				var xx = (m11 + 1) / 2;
				var yy = (m22 + 1) / 2;
				var zz = (m33 + 1) / 2;
				var xy = (m12 + m21) / 4;
				var xz = (m13 + m31) / 4;
				var yz = (m23 + m32) / 4;

				if (xx > yy && xx > zz) {
					// m11 is the largest diagonal term
					if (xx < epsilon) {
						x = 0;
						y = 0.707106781;
						z = 0.707106781;
					} else {
						x = Math.sqrt(xx);
						y = xy / x;
						z = xz / x;
					}
				} else if (yy > zz) {
					// m22 is the largest diagonal term
					if (yy < epsilon) {
						x = 0.707106781;
						y = 0;
						z = 0.707106781;
					} else {
						y = Math.sqrt(yy);
						x = xy / y;
						z = yz / y;
					}
				} else {
					// m33 is the largest diagonal term so base result on this
					if (zz < epsilon) {
						x = 0.707106781;
						y = 0.707106781;
						z = 0;
					} else {
						z = Math.sqrt(zz);
						x = xz / z;
						y = yz / z;
					}
				}

				this.set(x, y, z, angle);
				return this; // return 180 deg rotation
			} // as we have reached here there are no singularities so we can handle normally


			var s = Math.sqrt((m32 - m23) * (m32 - m23) + (m13 - m31) * (m13 - m31) + (m21 - m12) * (m21 - m12)); // used to normalize

			if (Math.abs(s) < 0.001) s = 1; // prevent divide by zero, should not happen if matrix is orthogonal and should be
			// caught by singularity test above, but I've left it in just in case

			this.x = (m32 - m23) / s;
			this.y = (m13 - m31) / s;
			this.z = (m21 - m12) / s;
			this.w = Math.acos((m11 + m22 + m33 - 1) / 2);
			return this;
		};

		_proto.min = function min(v) {
			this.x = Math.min(this.x, v.x);
			this.y = Math.min(this.y, v.y);
			this.z = Math.min(this.z, v.z);
			this.w = Math.min(this.w, v.w);
			return this;
		};

		_proto.max = function max(v) {
			this.x = Math.max(this.x, v.x);
			this.y = Math.max(this.y, v.y);
			this.z = Math.max(this.z, v.z);
			this.w = Math.max(this.w, v.w);
			return this;
		};

		_proto.clamp = function clamp(min, max) {
			// assumes min < max, componentwise
			this.x = Math.max(min.x, Math.min(max.x, this.x));
			this.y = Math.max(min.y, Math.min(max.y, this.y));
			this.z = Math.max(min.z, Math.min(max.z, this.z));
			this.w = Math.max(min.w, Math.min(max.w, this.w));
			return this;
		};

		_proto.clampScalar = function clampScalar(minVal, maxVal) {
			this.x = Math.max(minVal, Math.min(maxVal, this.x));
			this.y = Math.max(minVal, Math.min(maxVal, this.y));
			this.z = Math.max(minVal, Math.min(maxVal, this.z));
			this.w = Math.max(minVal, Math.min(maxVal, this.w));
			return this;
		};

		_proto.clampLength = function clampLength(min, max) {
			var length = this.length();
			return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
		};

		_proto.floor = function floor() {
			this.x = Math.floor(this.x);
			this.y = Math.floor(this.y);
			this.z = Math.floor(this.z);
			this.w = Math.floor(this.w);
			return this;
		};

		_proto.ceil = function ceil() {
			this.x = Math.ceil(this.x);
			this.y = Math.ceil(this.y);
			this.z = Math.ceil(this.z);
			this.w = Math.ceil(this.w);
			return this;
		};

		_proto.round = function round() {
			this.x = Math.round(this.x);
			this.y = Math.round(this.y);
			this.z = Math.round(this.z);
			this.w = Math.round(this.w);
			return this;
		};

		_proto.roundToZero = function roundToZero() {
			this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
			this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
			this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);
			this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w);
			return this;
		};

		_proto.negate = function negate() {
			this.x = -this.x;
			this.y = -this.y;
			this.z = -this.z;
			this.w = -this.w;
			return this;
		};

		_proto.dot = function dot(v) {
			return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
		};

		_proto.lengthSq = function lengthSq() {
			return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
		};

		_proto.length = function length() {
			return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
		};

		_proto.manhattanLength = function manhattanLength() {
			return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
		};

		_proto.normalize = function normalize() {
			return this.divideScalar(this.length() || 1);
		};

		_proto.setLength = function setLength(length) {
			return this.normalize().multiplyScalar(length);
		};

		_proto.lerp = function lerp(v, alpha) {
			this.x += (v.x - this.x) * alpha;
			this.y += (v.y - this.y) * alpha;
			this.z += (v.z - this.z) * alpha;
			this.w += (v.w - this.w) * alpha;
			return this;
		};

		_proto.lerpVectors = function lerpVectors(v1, v2, alpha) {
			this.x = v1.x + (v2.x - v1.x) * alpha;
			this.y = v1.y + (v2.y - v1.y) * alpha;
			this.z = v1.z + (v2.z - v1.z) * alpha;
			this.w = v1.w + (v2.w - v1.w) * alpha;
			return this;
		};

		_proto.equals = function equals(v) {
			return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
		};

		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}

			this.x = array[offset];
			this.y = array[offset + 1];
			this.z = array[offset + 2];
			this.w = array[offset + 3];
			return this;
		};

		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}

			if (offset === void 0) {
				offset = 0;
			}

			array[offset] = this.x;
			array[offset + 1] = this.y;
			array[offset + 2] = this.z;
			array[offset + 3] = this.w;
			return array;
		};

		_proto.fromBufferAttribute = function fromBufferAttribute(attribute, index, offset) {
			if (offset !== undefined) {
				console.warn('THREE.Vector4: offset has been removed from .fromBufferAttribute().');
			}

			this.x = attribute.getX(index);
			this.y = attribute.getY(index);
			this.z = attribute.getZ(index);
			this.w = attribute.getW(index);
			return this;
		};

		_proto.random = function random() {
			this.x = Math.random();
			this.y = Math.random();
			this.z = Math.random();
			this.w = Math.random();
			return this;
		};

		_createClass(Vector4, [{
			key: "width",
			get: function get() {
				return this.z;
			},
			set: function set(value) {
				this.z = value;
			}
		}, {
			key: "height",
			get: function get() {
				return this.w;
			},
			set: function set(value) {
				this.w = value;
			}
		}]);

		return Vector4;
	}();

	/*
	 In options, we can specify:
	 * Texture parameters for an auto-generated target texture
	 * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
	*/

	var WebGLRenderTarget = /*#__PURE__*/function (_EventDispatcher) {
		_inheritsLoose(WebGLRenderTarget, _EventDispatcher);

		function WebGLRenderTarget(width, height, options) {
			var _this;

			_this = _EventDispatcher.call(this) || this;
			Object.defineProperty(_assertThisInitialized(_this), 'isWebGLRenderTarget', {
				value: true
			});
			_this.width = width;
			_this.height = height;
			_this.scissor = new Vector4(0, 0, width, height);
			_this.scissorTest = false;
			_this.viewport = new Vector4(0, 0, width, height);
			options = options || {};
			_this.texture = new Texture(undefined, options.mapping, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.encoding);
			_this.texture.image = {};
			_this.texture.image.width = width;
			_this.texture.image.height = height;
			_this.texture.generateMipmaps = options.generateMipmaps !== undefined ? options.generateMipmaps : false;
			_this.texture.minFilter = options.minFilter !== undefined ? options.minFilter : LinearFilter;
			_this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
			_this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : false;
			_this.depthTexture = options.depthTexture !== undefined ? options.depthTexture : null;
			return _this;
		}

		var _proto = WebGLRenderTarget.prototype;

		_proto.setSize = function setSize(width, height) {
			if (this.width !== width || this.height !== height) {
				this.width = width;
				this.height = height;
				this.texture.image.width = width;
				this.texture.image.height = height;
				this.dispose();
			}

			this.viewport.set(0, 0, width, height);
			this.scissor.set(0, 0, width, height);
		};

		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		};

		_proto.copy = function copy(source) {
			this.width = source.width;
			this.height = source.height;
			this.viewport.copy(source.viewport);
			this.texture = source.texture.clone();
			this.depthBuffer = source.depthBuffer;
			this.stencilBuffer = source.stencilBuffer;
			this.depthTexture = source.depthTexture;
			return this;
		};

		_proto.dispose = function dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		};

		return WebGLRenderTarget;
	}(EventDispatcher);

	var WebGLMultisampleRenderTarget = /*#__PURE__*/function (_WebGLRenderTarget) {
		_inheritsLoose(WebGLMultisampleRenderTarget, _WebGLRenderTarget);

		function WebGLMultisampleRenderTarget(width, height, options) {
			var _this;

			_this = _WebGLRenderTarget.call(this, width, height, options) || this;
			Object.defineProperty(_assertThisInitialized(_this), 'isWebGLMultisampleRenderTarget', {
				value: true
			});
			_this.samples = 4;
			return _this;
		}

		var _proto = WebGLMultisampleRenderTarget.prototype;

		_proto.copy = function copy(source) {
			_WebGLRenderTarget.prototype.copy.call(this, source);

			this.samples = source.samples;
			return this;
		};

		return WebGLMultisampleRenderTarget;
	}(WebGLRenderTarget);

	var Quaternion = /*#__PURE__*/function () {
		function Quaternion(x, y, z, w) {
			if (x === void 0) {
				x = 0;
			}

			if (y === void 0) {
				y = 0;
			}

			if (z === void 0) {
				z = 0;
			}

			if (w === void 0) {
				w = 1;
			}

			Object.defineProperty(this, 'isQuaternion', {
				value: true
			});
			this._x = x;
			this._y = y;
			this._z = z;
			this._w = w;
		}

		Quaternion.slerp = function slerp(qa, qb, qm, t) {
			return qm.copy(qa).slerp(qb, t);
		};

		Quaternion.slerpFlat = function slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
			// fuzz-free, array-based Quaternion SLERP operation
			var x0 = src0[srcOffset0 + 0],
					y0 = src0[srcOffset0 + 1],
					z0 = src0[srcOffset0 + 2],
					w0 = src0[srcOffset0 + 3];
			var x1 = src1[srcOffset1 + 0],
					y1 = src1[srcOffset1 + 1],
					z1 = src1[srcOffset1 + 2],
					w1 = src1[srcOffset1 + 3];

			if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
				var s = 1 - t;
				var cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
						dir = cos >= 0 ? 1 : -1,
						sqrSin = 1 - cos * cos; // Skip the Slerp for tiny steps to avoid numeric problems:

				if (sqrSin > Number.EPSILON) {
					var sin = Math.sqrt(sqrSin),
							len = Math.atan2(sin, cos * dir);
					s = Math.sin(s * len) / sin;
					t = Math.sin(t * len) / sin;
				}

				var tDir = t * dir;
				x0 = x0 * s + x1 * tDir;
				y0 = y0 * s + y1 * tDir;
				z0 = z0 * s + z1 * tDir;
				w0 = w0 * s + w1 * tDir; // Normalize in case we just did a lerp:

				if (s === 1 - t) {
					var f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
					x0 *= f;
					y0 *= f;
					z0 *= f;
					w0 *= f;
				}
			}

			dst[dstOffset] = x0;
			dst[dstOffset + 1] = y0;
			dst[dstOffset + 2] = z0;
			dst[dstOffset + 3] = w0;
		};

		Quaternion.multiplyQuaternionsFlat = function multiplyQuaternionsFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1) {
			var x0 = src0[srcOffset0];
			var y0 = src0[srcOffset0 + 1];
			var z0 = src0[srcOffset0 + 2];
			var w0 = src0[srcOffset0 + 3];
			var x1 = src1[srcOffset1];
			var y1 = src1[srcOffset1 + 1];
			var z1 = src1[srcOffset1 + 2];
			var w1 = src1[srcOffset1 + 3];
			dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
			dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
			dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
			dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;
			return dst;
		};

		var _proto = Quaternion.prototype;

		_proto.set = function set(x, y, z, w) {
			this._x = x;
			this._y = y;
			this._z = z;
			this._w = w;

			this._onChangeCallback();

			return this;
		};

		_proto.clone = function clone() {
			return new this.constructor(this._x, this._y, this._z, this._w);
		};

		_proto.copy = function copy(quaternion) {
			this._x = quaternion.x;
			this._y = quaternion.y;
			this._z = quaternion.z;
			this._w = quaternion.w;

			this._onChangeCallback();

			return this;
		};

		_proto.setFromEuler = function setFromEuler(euler, update) {
			if (!(euler && euler.isEuler)) {
				throw new Error('THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.');
			}

			var x = euler._x,
					y = euler._y,
					z = euler._z,
					order = euler._order; // http://www.mathworks.com/matlabcentral/fileexchange/
			// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
			//	content/SpinCalc.m

			var cos = Math.cos;
			var sin = Math.sin;
			var c1 = cos(x / 2);
			var c2 = cos(y / 2);
			var c3 = cos(z / 2);
			var s1 = sin(x / 2);
			var s2 = sin(y / 2);
			var s3 = sin(z / 2);

			switch (order) {
				case 'XYZ':
					this._x = s1 * c2 * c3 + c1 * s2 * s3;
					this._y = c1 * s2 * c3 - s1 * c2 * s3;
					this._z = c1 * c2 * s3 + s1 * s2 * c3;
					this._w = c1 * c2 * c3 - s1 * s2 * s3;
					break;

				case 'YXZ':
					this._x = s1 * c2 * c3 + c1 * s2 * s3;
					this._y = c1 * s2 * c3 - s1 * c2 * s3;
					this._z = c1 * c2 * s3 - s1 * s2 * c3;
					this._w = c1 * c2 * c3 + s1 * s2 * s3;
					break;

				case 'ZXY':
					this._x = s1 * c2 * c3 - c1 * s2 * s3;
					this._y = c1 * s2 * c3 + s1 * c2 * s3;
					this._z = c1 * c2 * s3 + s1 * s2 * c3;
					this._w = c1 * c2 * c3 - s1 * s2 * s3;
					break;

				case 'ZYX':
					this._x = s1 * c2 * c3 - c1 * s2 * s3;
					this._y = c1 * s2 * c3 + s1 * c2 * s3;
					this._z = c1 * c2 * s3 - s1 * s2 * c3;
					this._w = c1 * c2 * c3 + s1 * s2 * s3;
					break;

				case 'YZX':
					this._x = s1 * c2 * c3 + c1 * s2 * s3;
					this._y = c1 * s2 * c3 + s1 * c2 * s3;
					this._z = c1 * c2 * s3 - s1 * s2 * c3;
					this._w = c1 * c2 * c3 - s1 * s2 * s3;
					break;

				case 'XZY':
					this._x = s1 * c2 * c3 - c1 * s2 * s3;
					this._y = c1 * s2 * c3 - s1 * c2 * s3;
					this._z = c1 * c2 * s3 + s1 * s2 * c3;
					this._w = c1 * c2 * c3 + s1 * s2 * s3;
					break;

				default:
					console.warn('THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + order);
			}

			if (update !== false) this._onChangeCallback();
			return this;
		};

		_proto.setFromAxisAngle = function setFromAxisAngle(axis, angle) {
			// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
			// assumes axis is normalized
			var halfAngle = angle / 2,
					s = Math.sin(halfAngle);
			this._x = axis.x * s;
			this._y = axis.y * s;
			this._z = axis.z * s;
			this._w = Math.cos(halfAngle);

			this._onChangeCallback();

			return this;
		};

		_proto.setFromRotationMatrix = function setFromRotationMatrix(m) {
			// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
			// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
			var te = m.elements,
					m11 = te[0],
					m12 = te[4],
					m13 = te[8],
					m21 = te[1],
					m22 = te[5],
					m23 = te[9],
					m31 = te[2],
					m32 = te[6],
					m33 = te[10],
					trace = m11 + m22 + m33;

			if (trace > 0) {
				var s = 0.5 / Math.sqrt(trace + 1.0);
				this._w = 0.25 / s;
				this._x = (m32 - m23) * s;
				this._y = (m13 - m31) * s;
				this._z = (m21 - m12) * s;
			} else if (m11 > m22 && m11 > m33) {
				var _s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

				this._w = (m32 - m23) / _s;
				this._x = 0.25 * _s;
				this._y = (m12 + m21) / _s;
				this._z = (m13 + m31) / _s;
			} else if (m22 > m33) {
				var _s2 = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

				this._w = (m13 - m31) / _s2;
				this._x = (m12 + m21) / _s2;
				this._y = 0.25 * _s2;
				this._z = (m23 + m32) / _s2;
			} else {
				var _s3 = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

				this._w = (m21 - m12) / _s3;
				this._x = (m13 + m31) / _s3;
				this._y = (m23 + m32) / _s3;
				this._z = 0.25 * _s3;
			}

			this._onChangeCallback();

			return this;
		};

		_proto.setFromUnitVectors = function setFromUnitVectors(vFrom, vTo) {
			// assumes direction vectors vFrom and vTo are normalized
			var EPS = 0.000001;
			var r = vFrom.dot(vTo) + 1;

			if (r < EPS) {
				r = 0;

				if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
					this._x = -vFrom.y;
					this._y = vFrom.x;
					this._z = 0;
					this._w = r;
				} else {
					this._x = 0;
					this._y = -vFrom.z;
					this._z = vFrom.y;
					this._w = r;
				}
			} else {
				// crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3
				this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
				this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
				this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
				this._w = r;
			}

			return this.normalize();
		};

		_proto.angleTo = function angleTo(q) {
			return 2 * Math.acos(Math.abs(MathUtils.clamp(this.dot(q), -1, 1)));
		};

		_proto.rotateTowards = function rotateTowards(q, step) {
			var angle = this.angleTo(q);
			if (angle === 0) return this;
			var t = Math.min(1, step / angle);
			this.slerp(q, t);
			return this;
		};

		_proto.identity = function identity() {
			return this.set(0, 0, 0, 1);
		};

		_proto.invert = function invert() {
			// quaternion is assumed to have unit length
			return this.conjugate();
		};

		_proto.conjugate = function conjugate() {
			this._x *= -1;
			this._y *= -1;
			this._z *= -1;

			this._onChangeCallback();

			return this;
		};

		_proto.dot = function dot(v) {
			return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
		};

		_proto.lengthSq = function lengthSq() {
			return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
		};

		_proto.length = function length() {
			return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
		};

		_proto.normalize = function normalize() {
			var l = this.length();

			if (l === 0) {
				this._x = 0;
				this._y = 0;
				this._z = 0;
				this._w = 1;
			} else {
				l = 1 / l;
				this._x = this._x * l;
				this._y = this._y * l;
				this._z = this._z * l;
				this._w = this._w * l;
			}

			this._onChangeCallback();

			return this;
		};

		_proto.multiply = function multiply(q, p) {
			if (p !== undefined) {
				console.warn('THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.');
				return this.multiplyQuaternions(q, p);
			}

			return this.multiplyQuaternions(this, q);
		};

		_proto.premultiply = function premultiply(q) {
			return this.multiplyQuaternions(q, this);
		};

		_proto.multiplyQuaternions = function multiplyQuaternions(a, b) {
			// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm
			var qax = a._x,
					qay = a._y,
					qaz = a._z,
					qaw = a._w;
			var qbx = b._x,
					qby = b._y,
					qbz = b._z,
					qbw = b._w;
			this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
			this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
			this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
			this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

			this._onChangeCallback();

			return this;
		};

		_proto.slerp = function slerp(qb, t) {
			if (t === 0) return this;
			if (t === 1) return this.copy(qb);
			var x = this._x,
					y = this._y,
					z = this._z,
					w = this._w; // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

			var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

			if (cosHalfTheta < 0) {
				this._w = -qb._w;
				this._x = -qb._x;
				this._y = -qb._y;
				this._z = -qb._z;
				cosHalfTheta = -cosHalfTheta;
			} else {
				this.copy(qb);
			}

			if (cosHalfTheta >= 1.0) {
				this._w = w;
				this._x = x;
				this._y = y;
				this._z = z;
				return this;
			}

			var sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

			if (sqrSinHalfTheta <= Number.EPSILON) {
				var s = 1 - t;
				this._w = s * w + t * this._w;
				this._x = s * x + t * this._x;
				this._y = s * y + t * this._y;
				this._z = s * z + t * this._z;
				this.normalize();

				this._onChangeCallback();

				return this;
			}

			var sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
			var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
			var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
					ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
			this._w = w * ratioA + this._w * ratioB;
			this._x = x * ratioA + this._x * ratioB;
			this._y = y * ratioA + this._y * ratioB;
			this._z = z * ratioA + this._z * ratioB;

			this._onChangeCallback();

			return this;
		};

		_proto.equals = function equals(quaternion) {
			return quaternion._x === this._x && quaternion._y === this._y && quaternion._z === this._z && quaternion._w === this._w;
		};

		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}

			this._x = array[offset];
			this._y = array[offset + 1];
			this._z = array[offset + 2];
			this._w = array[offset + 3];

			this._onChangeCallback();

			return this;
		};

		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}

			if (offset === void 0) {
				offset = 0;
			}

			array[offset] = this._x;
			array[offset + 1] = this._y;
			array[offset + 2] = this._z;
			array[offset + 3] = this._w;
			return array;
		};

		_proto.fromBufferAttribute = function fromBufferAttribute(attribute, index) {
			this._x = attribute.getX(index);
			this._y = attribute.getY(index);
			this._z = attribute.getZ(index);
			this._w = attribute.getW(index);
			return this;
		};

		_proto._onChange = function _onChange(callback) {
			this._onChangeCallback = callback;
			return this;
		};

		_proto._onChangeCallback = function _onChangeCallback() {};

		_createClass(Quaternion, [{
			key: "x",
			get: function get() {
				return this._x;
			},
			set: function set(value) {
				this._x = value;

				this._onChangeCallback();
			}
		}, {
			key: "y",
			get: function get() {
				return this._y;
			},
			set: function set(value) {
				this._y = value;

				this._onChangeCallback();
			}
		}, {
			key: "z",
			get: function get() {
				return this._z;
			},
			set: function set(value) {
				this._z = value;

				this._onChangeCallback();
			}
		}, {
			key: "w",
			get: function get() {
				return this._w;
			},
			set: function set(value) {
				this._w = value;

				this._onChangeCallback();
			}
		}]);

		return Quaternion;
	}();

	var Vector3 = /*#__PURE__*/function () {
		function Vector3(x, y, z) {
			if (x === void 0) {
				x = 0;
			}

			if (y === void 0) {
				y = 0;
			}

			if (z === void 0) {
				z = 0;
			}

			Object.defineProperty(this, 'isVector3', {
				value: true
			});
			this.x = x;
			this.y = y;
			this.z = z;
		}

		var _proto = Vector3.prototype;

		_proto.set = function set(x, y, z) {
			if (z === undefined) z = this.z; // sprite.scale.set(x,y)

			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		};

		_proto.setScalar = function setScalar(scalar) {
			this.x = scalar;
			this.y = scalar;
			this.z = scalar;
			return this;
		};

		_proto.setX = function setX(x) {
			this.x = x;
			return this;
		};

		_proto.setY = function setY(y) {
			this.y = y;
			return this;
		};

		_proto.setZ = function setZ(z) {
			this.z = z;
			return this;
		};

		_proto.setComponent = function setComponent(index, value) {
			switch (index) {
				case 0:
					this.x = value;
					break;

				case 1:
					this.y = value;
					break;

				case 2:
					this.z = value;
					break;

				default:
					throw new Error('index is out of range: ' + index);
			}

			return this;
		};

		_proto.getComponent = function getComponent(index) {
			switch (index) {
				case 0:
					return this.x;

				case 1:
					return this.y;

				case 2:
					return this.z;

				default:
					throw new Error('index is out of range: ' + index);
			}
		};

		_proto.clone = function clone() {
			return new this.constructor(this.x, this.y, this.z);
		};

		_proto.copy = function copy(v) {
			this.x = v.x;
			this.y = v.y;
			this.z = v.z;
			return this;
		};

		_proto.add = function add(v, w) {
			if (w !== undefined) {
				console.warn('THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.');
				return this.addVectors(v, w);
			}

			this.x += v.x;
			this.y += v.y;
			this.z += v.z;
			return this;
		};

		_proto.addScalar = function addScalar(s) {
			this.x += s;
			this.y += s;
			this.z += s;
			return this;
		};

		_proto.addVectors = function addVectors(a, b) {
			this.x = a.x + b.x;
			this.y = a.y + b.y;
			this.z = a.z + b.z;
			return this;
		};

		_proto.addScaledVector = function addScaledVector(v, s) {
			this.x += v.x * s;
			this.y += v.y * s;
			this.z += v.z * s;
			return this;
		};

		_proto.sub = function sub(v, w) {
			if (w !== undefined) {
				console.warn('THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
				return this.subVectors(v, w);
			}

			this.x -= v.x;
			this.y -= v.y;
			this.z -= v.z;
			return this;
		};

		_proto.subScalar = function subScalar(s) {
			this.x -= s;
			this.y -= s;
			this.z -= s;
			return this;
		};

		_proto.subVectors = function subVectors(a, b) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;
			return this;
		};

		_proto.multiply = function multiply(v, w) {
			if (w !== undefined) {
				console.warn('THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.');
				return this.multiplyVectors(v, w);
			}

			this.x *= v.x;
			this.y *= v.y;
			this.z *= v.z;
			return this;
		};

		_proto.multiplyScalar = function multiplyScalar(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			return this;
		};

		_proto.multiplyVectors = function multiplyVectors(a, b) {
			this.x = a.x * b.x;
			this.y = a.y * b.y;
			this.z = a.z * b.z;
			return this;
		};

		_proto.applyEuler = function applyEuler(euler) {
			if (!(euler && euler.isEuler)) {
				console.error('THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.');
			}

			return this.applyQuaternion(_quaternion.setFromEuler(euler));
		};

		_proto.applyAxisAngle = function applyAxisAngle(axis, angle) {
			return this.applyQuaternion(_quaternion.setFromAxisAngle(axis, angle));
		};

		_proto.applyMatrix3 = function applyMatrix3(m) {
			var x = this.x,
					y = this.y,
					z = this.z;
			var e = m.elements;
			this.x = e[0] * x + e[3] * y + e[6] * z;
			this.y = e[1] * x + e[4] * y + e[7] * z;
			this.z = e[2] * x + e[5] * y + e[8] * z;
			return this;
		};

		_proto.applyNormalMatrix = function applyNormalMatrix(m) {
			return this.applyMatrix3(m).normalize();
		};

		_proto.applyMatrix4 = function applyMatrix4(m) {
			var x = this.x,
					y = this.y,
					z = this.z;
			var e = m.elements;
			var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
			this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
			this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
			this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
			return this;
		};

		_proto.applyQuaternion = function applyQuaternion(q) {
			var x = this.x,
					y = this.y,
					z = this.z;
			var qx = q.x,
					qy = q.y,
					qz = q.z,
					qw = q.w; // calculate quat * vector

			var ix = qw * x + qy * z - qz * y;
			var iy = qw * y + qz * x - qx * z;
			var iz = qw * z + qx * y - qy * x;
			var iw = -qx * x - qy * y - qz * z; // calculate result * inverse quat

			this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
			this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
			this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
			return this;
		};

		_proto.project = function project(camera) {
			return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
		};

		_proto.unproject = function unproject(camera) {
			return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
		};

		_proto.transformDirection = function transformDirection(m) {
			// input: THREE.Matrix4 affine matrix
			// vector interpreted as a direction
			var x = this.x,
					y = this.y,
					z = this.z;
			var e = m.elements;
			this.x = e[0] * x + e[4] * y + e[8] * z;
			this.y = e[1] * x + e[5] * y + e[9] * z;
			this.z = e[2] * x + e[6] * y + e[10] * z;
			return this.normalize();
		};

		_proto.divide = function divide(v) {
			this.x /= v.x;
			this.y /= v.y;
			this.z /= v.z;
			return this;
		};

		_proto.divideScalar = function divideScalar(scalar) {
			return this.multiplyScalar(1 / scalar);
		};

		_proto.min = function min(v) {
			this.x = Math.min(this.x, v.x);
			this.y = Math.min(this.y, v.y);
			this.z = Math.min(this.z, v.z);
			return this;
		};

		_proto.max = function max(v) {
			this.x = Math.max(this.x, v.x);
			this.y = Math.max(this.y, v.y);
			this.z = Math.max(this.z, v.z);
			return this;
		};

		_proto.clamp = function clamp(min, max) {
			// assumes min < max, componentwise
			this.x = Math.max(min.x, Math.min(max.x, this.x));
			this.y = Math.max(min.y, Math.min(max.y, this.y));
			this.z = Math.max(min.z, Math.min(max.z, this.z));
			return this;
		};

		_proto.clampScalar = function clampScalar(minVal, maxVal) {
			this.x = Math.max(minVal, Math.min(maxVal, this.x));
			this.y = Math.max(minVal, Math.min(maxVal, this.y));
			this.z = Math.max(minVal, Math.min(maxVal, this.z));
			return this;
		};

		_proto.clampLength = function clampLength(min, max) {
			var length = this.length();
			return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
		};

		_proto.floor = function floor() {
			this.x = Math.floor(this.x);
			this.y = Math.floor(this.y);
			this.z = Math.floor(this.z);
			return this;
		};

		_proto.ceil = function ceil() {
			this.x = Math.ceil(this.x);
			this.y = Math.ceil(this.y);
			this.z = Math.ceil(this.z);
			return this;
		};

		_proto.round = function round() {
			this.x = Math.round(this.x);
			this.y = Math.round(this.y);
			this.z = Math.round(this.z);
			return this;
		};

		_proto.roundToZero = function roundToZero() {
			this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
			this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
			this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);
			return this;
		};

		_proto.negate = function negate() {
			this.x = -this.x;
			this.y = -this.y;
			this.z = -this.z;
			return this;
		};

		_proto.dot = function dot(v) {
			return this.x * v.x + this.y * v.y + this.z * v.z;
		} // TODO lengthSquared?
		;

		_proto.lengthSq = function lengthSq() {
			return this.x * this.x + this.y * this.y + this.z * this.z;
		};

		_proto.length = function length() {
			return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
		};

		_proto.manhattanLength = function manhattanLength() {
			return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
		};

		_proto.normalize = function normalize() {
			return this.divideScalar(this.length() || 1);
		};

		_proto.setLength = function setLength(length) {
			return this.normalize().multiplyScalar(length);
		};

		_proto.lerp = function lerp(v, alpha) {
			this.x += (v.x - this.x) * alpha;
			this.y += (v.y - this.y) * alpha;
			this.z += (v.z - this.z) * alpha;
			return this;
		};

		_proto.lerpVectors = function lerpVectors(v1, v2, alpha) {
			this.x = v1.x + (v2.x - v1.x) * alpha;
			this.y = v1.y + (v2.y - v1.y) * alpha;
			this.z = v1.z + (v2.z - v1.z) * alpha;
			return this;
		};

		_proto.cross = function cross(v, w) {
			if (w !== undefined) {
				console.warn('THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.');
				return this.crossVectors(v, w);
			}

			return this.crossVectors(this, v);
		};

		_proto.crossVectors = function crossVectors(a, b) {
			var ax = a.x,
					ay = a.y,
					az = a.z;
			var bx = b.x,
					by = b.y,
					bz = b.z;
			this.x = ay * bz - az * by;
			this.y = az * bx - ax * bz;
			this.z = ax * by - ay * bx;
			return this;
		};

		_proto.projectOnVector = function projectOnVector(v) {
			var denominator = v.lengthSq();
			if (denominator === 0) return this.set(0, 0, 0);
			var scalar = v.dot(this) / denominator;
			return this.copy(v).multiplyScalar(scalar);
		};

		_proto.projectOnPlane = function projectOnPlane(planeNormal) {
			_vector.copy(this).projectOnVector(planeNormal);

			return this.sub(_vector);
		};

		_proto.reflect = function reflect(normal) {
			// reflect incident vector off plane orthogonal to normal
			// normal is assumed to have unit length
			return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));
		};

		_proto.angleTo = function angleTo(v) {
			var denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
			if (denominator === 0) return Math.PI / 2;
			var theta = this.dot(v) / denominator; // clamp, to handle numerical problems

			return Math.acos(MathUtils.clamp(theta, -1, 1));
		};

		_proto.distanceTo = function distanceTo(v) {
			return Math.sqrt(this.distanceToSquared(v));
		};

		_proto.distanceToSquared = function distanceToSquared(v) {
			var dx = this.x - v.x,
					dy = this.y - v.y,
					dz = this.z - v.z;
			return dx * dx + dy * dy + dz * dz;
		};

		_proto.manhattanDistanceTo = function manhattanDistanceTo(v) {
			return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
		};

		_proto.setFromSpherical = function setFromSpherical(s) {
			return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
		};

		_proto.setFromSphericalCoords = function setFromSphericalCoords(radius, phi, theta) {
			var sinPhiRadius = Math.sin(phi) * radius;
			this.x = sinPhiRadius * Math.sin(theta);
			this.y = Math.cos(phi) * radius;
			this.z = sinPhiRadius * Math.cos(theta);
			return this;
		};

		_proto.setFromCylindrical = function setFromCylindrical(c) {
			return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
		};

		_proto.setFromCylindricalCoords = function setFromCylindricalCoords(radius, theta, y) {
			this.x = radius * Math.sin(theta);
			this.y = y;
			this.z = radius * Math.cos(theta);
			return this;
		};

		_proto.setFromMatrixPosition = function setFromMatrixPosition(m) {
			var e = m.elements;
			this.x = e[12];
			this.y = e[13];
			this.z = e[14];
			return this;
		};

		_proto.setFromMatrixScale = function setFromMatrixScale(m) {
			var sx = this.setFromMatrixColumn(m, 0).length();
			var sy = this.setFromMatrixColumn(m, 1).length();
			var sz = this.setFromMatrixColumn(m, 2).length();
			this.x = sx;
			this.y = sy;
			this.z = sz;
			return this;
		};

		_proto.setFromMatrixColumn = function setFromMatrixColumn(m, index) {
			return this.fromArray(m.elements, index * 4);
		};

		_proto.setFromMatrix3Column = function setFromMatrix3Column(m, index) {
			return this.fromArray(m.elements, index * 3);
		};

		_proto.equals = function equals(v) {
			return v.x === this.x && v.y === this.y && v.z === this.z;
		};

		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}

			this.x = array[offset];
			this.y = array[offset + 1];
			this.z = array[offset + 2];
			return this;
		};

		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}

			if (offset === void 0) {
				offset = 0;
			}

			array[offset] = this.x;
			array[offset + 1] = this.y;
			array[offset + 2] = this.z;
			return array;
		};

		_proto.fromBufferAttribute = function fromBufferAttribute(attribute, index, offset) {
			if (offset !== undefined) {
				console.warn('THREE.Vector3: offset has been removed from .fromBufferAttribute().');
			}

			this.x = attribute.getX(index);
			this.y = attribute.getY(index);
			this.z = attribute.getZ(index);
			return this;
		};

		_proto.random = function random() {
			this.x = Math.random();
			this.y = Math.random();
			this.z = Math.random();
			return this;
		};

		return Vector3;
	}();

	var _vector = /*@__PURE__*/new Vector3();

	var _quaternion = /*@__PURE__*/new Quaternion();

	var Box3 = /*#__PURE__*/function () {
		function Box3(min, max) {
			Object.defineProperty(this, 'isBox3', {
				value: true
			});
			this.min = min !== undefined ? min : new Vector3(+Infinity, +Infinity, +Infinity);
			this.max = max !== undefined ? max : new Vector3(-Infinity, -Infinity, -Infinity);
		}

		var _proto = Box3.prototype;

		_proto.set = function set(min, max) {
			this.min.copy(min);
			this.max.copy(max);
			return this;
		};

		_proto.setFromArray = function setFromArray(array) {
			var minX = +Infinity;
			var minY = +Infinity;
			var minZ = +Infinity;
			var maxX = -Infinity;
			var maxY = -Infinity;
			var maxZ = -Infinity;

			for (var i = 0, l = array.length; i < l; i += 3) {
				var x = array[i];
				var y = array[i + 1];
				var z = array[i + 2];
				if (x < minX) minX = x;
				if (y < minY) minY = y;
				if (z < minZ) minZ = z;
				if (x > maxX) maxX = x;
				if (y > maxY) maxY = y;
				if (z > maxZ) maxZ = z;
			}

			this.min.set(minX, minY, minZ);
			this.max.set(maxX, maxY, maxZ);
			return this;
		};

		_proto.setFromBufferAttribute = function setFromBufferAttribute(attribute) {
			var minX = +Infinity;
			var minY = +Infinity;
			var minZ = +Infinity;
			var maxX = -Infinity;
			var maxY = -Infinity;
			var maxZ = -Infinity;

			for (var i = 0, l = attribute.count; i < l; i++) {
				var x = attribute.getX(i);
				var y = attribute.getY(i);
				var z = attribute.getZ(i);
				if (x < minX) minX = x;
				if (y < minY) minY = y;
				if (z < minZ) minZ = z;
				if (x > maxX) maxX = x;
				if (y > maxY) maxY = y;
				if (z > maxZ) maxZ = z;
			}

			this.min.set(minX, minY, minZ);
			this.max.set(maxX, maxY, maxZ);
			return this;
		};

		_proto.setFromPoints = function setFromPoints(points) {
			this.makeEmpty();

			for (var i = 0, il = points.length; i < il; i++) {
				this.expandByPoint(points[i]);
			}

			return this;
		};

		_proto.setFromCenterAndSize = function setFromCenterAndSize(center, size) {
			var halfSize = _vector$1.copy(size).multiplyScalar(0.5);

			this.min.copy(center).sub(halfSize);
			this.max.copy(center).add(halfSize);
			return this;
		};

		_proto.setFromObject = function setFromObject(object) {
			this.makeEmpty();
			return this.expandByObject(object);
		};

		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		};

		_proto.copy = function copy(box) {
			this.min.copy(box.min);
			this.max.copy(box.max);
			return this;
		};

		_proto.makeEmpty = function makeEmpty() {
			this.min.x = this.min.y = this.min.z = +Infinity;
			this.max.x = this.max.y = this.max.z = -Infinity;
			return this;
		};

		_proto.isEmpty = function isEmpty() {
			// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
			return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
		};

		_proto.getCenter = function getCenter(target) {
			if (target === undefined) {
				console.warn('THREE.Box3: .getCenter() target is now required');
				target = new Vector3();
			}

			return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
		};

		_proto.getSize = function getSize(target) {
			if (target === undefined) {
				console.warn('THREE.Box3: .getSize() target is now required');
				target = new Vector3();
			}

			return this.isEmpty() ? target.set(0, 0, 0) : target.subVectors(this.max, this.min);
		};

		_proto.expandByPoint = function expandByPoint(point) {
			this.min.min(point);
			this.max.max(point);
			return this;
		};

		_proto.expandByVector = function expandByVector(vector) {
			this.min.sub(vector);
			this.max.add(vector);
			return this;
		};

		_proto.expandByScalar = function expandByScalar(scalar) {
			this.min.addScalar(-scalar);
			this.max.addScalar(scalar);
			return this;
		};

		_proto.expandByObject = function expandByObject(object) {
			// Computes the world-axis-aligned bounding box of an object (including its children),
			// accounting for both the object's, and children's, world transforms
			object.updateWorldMatrix(false, false);
			var geometry = object.geometry;

			if (geometry !== undefined) {
				if (geometry.boundingBox === null) {
					geometry.computeBoundingBox();
				}

				_box.copy(geometry.boundingBox);

				_box.applyMatrix4(object.matrixWorld);

				this.union(_box);
			}

			var children = object.children;

			for (var i = 0, l = children.length; i < l; i++) {
				this.expandByObject(children[i]);
			}

			return this;
		};

		_proto.containsPoint = function containsPoint(point) {
			return point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y || point.z < this.min.z || point.z > this.max.z ? false : true;
		};

		_proto.containsBox = function containsBox(box) {
			return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y && this.min.z <= box.min.z && box.max.z <= this.max.z;
		};

		_proto.getParameter = function getParameter(point, target) {
			// This can potentially have a divide by zero if the box
			// has a size dimension of 0.
			if (target === undefined) {
				console.warn('THREE.Box3: .getParameter() target is now required');
				target = new Vector3();
			}

			return target.set((point.x - this.min.x) / (this.max.x - this.min.x), (point.y - this.min.y) / (this.max.y - this.min.y), (point.z - this.min.z) / (this.max.z - this.min.z));
		};

		_proto.intersectsBox = function intersectsBox(box) {
			// using 6 splitting planes to rule out intersections.
			return box.max.x < this.min.x || box.min.x > this.max.x || box.max.y < this.min.y || box.min.y > this.max.y || box.max.z < this.min.z || box.min.z > this.max.z ? false : true;
		};

		_proto.intersectsSphere = function intersectsSphere(sphere) {
			// Find the point on the AABB closest to the sphere center.
			this.clampPoint(sphere.center, _vector$1); // If that point is inside the sphere, the AABB and sphere intersect.

			return _vector$1.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius;
		};

		_proto.intersectsPlane = function intersectsPlane(plane) {
			// We compute the minimum and maximum dot product values. If those values
			// are on the same side (back or front) of the plane, then there is no intersection.
			var min, max;

			if (plane.normal.x > 0) {
				min = plane.normal.x * this.min.x;
				max = plane.normal.x * this.max.x;
			} else {
				min = plane.normal.x * this.max.x;
				max = plane.normal.x * this.min.x;
			}

			if (plane.normal.y > 0) {
				min += plane.normal.y * this.min.y;
				max += plane.normal.y * this.max.y;
			} else {
				min += plane.normal.y * this.max.y;
				max += plane.normal.y * this.min.y;
			}

			if (plane.normal.z > 0) {
				min += plane.normal.z * this.min.z;
				max += plane.normal.z * this.max.z;
			} else {
				min += plane.normal.z * this.max.z;
				max += plane.normal.z * this.min.z;
			}

			return min <= -plane.constant && max >= -plane.constant;
		};

		_proto.intersectsTriangle = function intersectsTriangle(triangle) {
			if (this.isEmpty()) {
				return false;
			} // compute box center and extents


			this.getCenter(_center);

			_extents.subVectors(this.max, _center); // translate triangle to aabb origin


			_v0.subVectors(triangle.a, _center);

			_v1.subVectors(triangle.b, _center);

			_v2.subVectors(triangle.c, _center); // compute edge vectors for triangle


			_f0.subVectors(_v1, _v0);

			_f1.subVectors(_v2, _v1);

			_f2.subVectors(_v0, _v2); // test against axes that are given by cross product combinations of the edges of the triangle and the edges of the aabb
			// make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the triangle = 9 axis of separation
			// axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes vectors since aabb is axis aligned)


			var axes = [0, -_f0.z, _f0.y, 0, -_f1.z, _f1.y, 0, -_f2.z, _f2.y, _f0.z, 0, -_f0.x, _f1.z, 0, -_f1.x, _f2.z, 0, -_f2.x, -_f0.y, _f0.x, 0, -_f1.y, _f1.x, 0, -_f2.y, _f2.x, 0];

			if (!satForAxes(axes, _v0, _v1, _v2, _extents)) {
				return false;
			} // test 3 face normals from the aabb


			axes = [1, 0, 0, 0, 1, 0, 0, 0, 1];

			if (!satForAxes(axes, _v0, _v1, _v2, _extents)) {
				return false;
			} // finally testing the face normal of the triangle
			// use already existing triangle edge vectors here


			_triangleNormal.crossVectors(_f0, _f1);

			axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z];
			return satForAxes(axes, _v0, _v1, _v2, _extents);
		};

		_proto.clampPoint = function clampPoint(point, target) {
			if (target === undefined) {
				console.warn('THREE.Box3: .clampPoint() target is now required');
				target = new Vector3();
			}

			return target.copy(point).clamp(this.min, this.max);
		};

		_proto.distanceToPoint = function distanceToPoint(point) {
			var clampedPoint = _vector$1.copy(point).clamp(this.min, this.max);

			return clampedPoint.sub(point).length();
		};

		_proto.getBoundingSphere = function getBoundingSphere(target) {
			if (target === undefined) {
				console.error('THREE.Box3: .getBoundingSphere() target is now required'); //target = new Sphere(); // removed to avoid cyclic dependency
			}

			this.getCenter(target.center);
			target.radius = this.getSize(_vector$1).length() * 0.5;
			return target;
		};

		_proto.intersect = function intersect(box) {
			this.min.max(box.min);
			this.max.min(box.max); // ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersects to erroneously return valid values.

			if (this.isEmpty()) this.makeEmpty();
			return this;
		};

		_proto.union = function union(box) {
			this.min.min(box.min);
			this.max.max(box.max);
			return this;
		};

		_proto.applyMatrix4 = function applyMatrix4(matrix) {
			// transform of empty box is an empty box.
			if (this.isEmpty()) return this; // NOTE: I am using a binary pattern to specify all 2^3 combinations below

			_points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix); // 000


			_points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix); // 001


			_points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix); // 010


			_points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix); // 011


			_points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix); // 100


			_points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix); // 101


			_points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix); // 110


			_points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix); // 111


			this.setFromPoints(_points);
			return this;
		};

		_proto.translate = function translate(offset) {
			this.min.add(offset);
			this.max.add(offset);
			return this;
		};

		_proto.equals = function equals(box) {
			return box.min.equals(this.min) && box.max.equals(this.max);
		};

		return Box3;
	}();

	function satForAxes(axes, v0, v1, v2, extents) {
		for (var i = 0, j = axes.length - 3; i <= j; i += 3) {
			_testAxis.fromArray(axes, i); // project the aabb onto the seperating axis


			var r = extents.x * Math.abs(_testAxis.x) + extents.y * Math.abs(_testAxis.y) + extents.z * Math.abs(_testAxis.z); // project all 3 vertices of the triangle onto the seperating axis

			var p0 = v0.dot(_testAxis);
			var p1 = v1.dot(_testAxis);
			var p2 = v2.dot(_testAxis); // actual test, basically see if either of the most extreme of the triangle points intersects r

			if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
				// points of the projected triangle are outside the projected half-length of the aabb
				// the axis is seperating and we can exit
				return false;
			}
		}

		return true;
	}

	var _points = [/*@__PURE__*/new Vector3(), /*@__PURE__*/new Vector3(), /*@__PURE__*/new Vector3(), /*@__PURE__*/new Vector3(), /*@__PURE__*/new Vector3(), /*@__PURE__*/new Vector3(), /*@__PURE__*/new Vector3(), /*@__PURE__*/new Vector3()];

	var _vector$1 = /*@__PURE__*/new Vector3();

	var _box = /*@__PURE__*/new Box3(); // triangle centered vertices


	var _v0 = /*@__PURE__*/new Vector3();

	var _v1 = /*@__PURE__*/new Vector3();

	var _v2 = /*@__PURE__*/new Vector3(); // triangle edge vectors


	var _f0 = /*@__PURE__*/new Vector3();

	var _f1 = /*@__PURE__*/new Vector3();

	var _f2 = /*@__PURE__*/new Vector3();

	var _center = /*@__PURE__*/new Vector3();

	var _extents = /*@__PURE__*/new Vector3();

	var _triangleNormal = /*@__PURE__*/new Vector3();

	var _testAxis = /*@__PURE__*/new Vector3();

	var _box$1 = /*@__PURE__*/new Box3();

	var Sphere = /*#__PURE__*/function () {
		function Sphere(center, radius) {
			this.center = center !== undefined ? center : new Vector3();
			this.radius = radius !== undefined ? radius : -1;
		}

		var _proto = Sphere.prototype;

		_proto.set = function set(center, radius) {
			this.center.copy(center);
			this.radius = radius;
			return this;
		};

		_proto.setFromPoints = function setFromPoints(points, optionalCenter) {
			var center = this.center;

			if (optionalCenter !== undefined) {
				center.copy(optionalCenter);
			} else {
				_box$1.setFromPoints(points).getCenter(center);
			}

			var maxRadiusSq = 0;

			for (var i = 0, il = points.length; i < il; i++) {
				maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
			}

			this.radius = Math.sqrt(maxRadiusSq);
			return this;
		};

		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		};

		_proto.copy = function copy(sphere) {
			this.center.copy(sphere.center);
			this.radius = sphere.radius;
			return this;
		};

		_proto.isEmpty = function isEmpty() {
			return this.radius < 0;
		};

		_proto.makeEmpty = function makeEmpty() {
			this.center.set(0, 0, 0);
			this.radius = -1;
			return this;
		};

		_proto.containsPoint = function containsPoint(point) {
			return point.distanceToSquared(this.center) <= this.radius * this.radius;
		};

		_proto.distanceToPoint = function distanceToPoint(point) {
			return point.distanceTo(this.center) - this.radius;
		};

		_proto.intersectsSphere = function intersectsSphere(sphere) {
			var radiusSum = this.radius + sphere.radius;
			return sphere.center.distanceToSquared(this.center) <= radiusSum * radiusSum;
		};

		_proto.intersectsBox = function intersectsBox(box) {
			return box.intersectsSphere(this);
		};

		_proto.intersectsPlane = function intersectsPlane(plane) {
			return Math.abs(plane.distanceToPoint(this.center)) <= this.radius;
		};

		_proto.clampPoint = function clampPoint(point, target) {
			var deltaLengthSq = this.center.distanceToSquared(point);

			if (target === undefined) {
				console.warn('THREE.Sphere: .clampPoint() target is now required');
				target = new Vector3();
			}

			target.copy(point);

			if (deltaLengthSq > this.radius * this.radius) {
				target.sub(this.center).normalize();
				target.multiplyScalar(this.radius).add(this.center);
			}

			return target;
		};

		_proto.getBoundingBox = function getBoundingBox(target) {
			if (target === undefined) {
				console.warn('THREE.Sphere: .getBoundingBox() target is now required');
				target = new Box3();
			}

			if (this.isEmpty()) {
				// Empty sphere produces empty bounding box
				target.makeEmpty();
				return target;
			}

			target.set(this.center, this.center);
			target.expandByScalar(this.radius);
			return target;
		};

		_proto.applyMatrix4 = function applyMatrix4(matrix) {
			this.center.applyMatrix4(matrix);
			this.radius = this.radius * matrix.getMaxScaleOnAxis();
			return this;
		};

		_proto.translate = function translate(offset) {
			this.center.add(offset);
			return this;
		};

		_proto.equals = function equals(sphere) {
			return sphere.center.equals(this.center) && sphere.radius === this.radius;
		};

		return Sphere;
	}();

	var _vector$2 = /*@__PURE__*/new Vector3();

	var _segCenter = /*@__PURE__*/new Vector3();

	var _segDir = /*@__PURE__*/new Vector3();

	var _diff = /*@__PURE__*/new Vector3();

	var _edge1 = /*@__PURE__*/new Vector3();

	var _edge2 = /*@__PURE__*/new Vector3();

	var _normal = /*@__PURE__*/new Vector3();

	var Ray = /*#__PURE__*/function () {
		function Ray(origin, direction) {
			this.origin = origin !== undefined ? origin : new Vector3();
			this.direction = direction !== undefined ? direction : new Vector3(0, 0, -1);
		}

		var _proto = Ray.prototype;

		_proto.set = function set(origin, direction) {
			this.origin.copy(origin);
			this.direction.copy(direction);
			return this;
		};

		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		};

		_proto.copy = function copy(ray) {
			this.origin.copy(ray.origin);
			this.direction.copy(ray.direction);
			return this;
		};

		_proto.at = function at(t, target) {
			if (target === undefined) {
				console.warn('THREE.Ray: .at() target is now required');
				target = new Vector3();
			}

			return target.copy(this.direction).multiplyScalar(t).add(this.origin);
		};

		_proto.lookAt = function lookAt(v) {
			this.direction.copy(v).sub(this.origin).normalize();
			return this;
		};

		_proto.recast = function recast(t) {
			this.origin.copy(this.at(t, _vector$2));
			return this;
		};

		_proto.closestPointToPoint = function closestPointToPoint(point, target) {
			if (target === undefined) {
				console.warn('THREE.Ray: .closestPointToPoint() target is now required');
				target = new Vector3();
			}

			target.subVectors(point, this.origin);
			var directionDistance = target.dot(this.direction);

			if (directionDistance < 0) {
				return target.copy(this.origin);
			}

			return target.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
		};

		_proto.distanceToPoint = function distanceToPoint(point) {
			return Math.sqrt(this.distanceSqToPoint(point));
		};

		_proto.distanceSqToPoint = function distanceSqToPoint(point) {
			var directionDistance = _vector$2.subVectors(point, this.origin).dot(this.direction); // point behind the ray


			if (directionDistance < 0) {
				return this.origin.distanceToSquared(point);
			}

			_vector$2.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);

			return _vector$2.distanceToSquared(point);
		};

		_proto.distanceSqToSegment = function distanceSqToSegment(v0, v1, optionalPointOnRay, optionalPointOnSegment) {
			// from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteDistRaySegment.h
			// It returns the min distance between the ray and the segment
			// defined by v0 and v1
			// It can also set two optional targets :
			// - The closest point on the ray
			// - The closest point on the segment
			_segCenter.copy(v0).add(v1).multiplyScalar(0.5);

			_segDir.copy(v1).sub(v0).normalize();

			_diff.copy(this.origin).sub(_segCenter);

			var segExtent = v0.distanceTo(v1) * 0.5;
			var a01 = -this.direction.dot(_segDir);

			var b0 = _diff.dot(this.direction);

			var b1 = -_diff.dot(_segDir);

			var c = _diff.lengthSq();

			var det = Math.abs(1 - a01 * a01);
			var s0, s1, sqrDist, extDet;

			if (det > 0) {
				// The ray and segment are not parallel.
				s0 = a01 * b1 - b0;
				s1 = a01 * b0 - b1;
				extDet = segExtent * det;

				if (s0 >= 0) {
					if (s1 >= -extDet) {
						if (s1 <= extDet) {
							// region 0
							// Minimum at interior points of ray and segment.
							var invDet = 1 / det;
							s0 *= invDet;
							s1 *= invDet;
							sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c;
						} else {
							// region 1
							s1 = segExtent;
							s0 = Math.max(0, -(a01 * s1 + b0));
							sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
						}
					} else {
						// region 5
						s1 = -segExtent;
						s0 = Math.max(0, -(a01 * s1 + b0));
						sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
					}
				} else {
					if (s1 <= -extDet) {
						// region 4
						s0 = Math.max(0, -(-a01 * segExtent + b0));
						s1 = s0 > 0 ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
						sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
					} else if (s1 <= extDet) {
						// region 3
						s0 = 0;
						s1 = Math.min(Math.max(-segExtent, -b1), segExtent);
						sqrDist = s1 * (s1 + 2 * b1) + c;
					} else {
						// region 2
						s0 = Math.max(0, -(a01 * segExtent + b0));
						s1 = s0 > 0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
						sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
					}
				}
			} else {
				// Ray and segment are parallel.
				s1 = a01 > 0 ? -segExtent : segExtent;
				s0 = Math.max(0, -(a01 * s1 + b0));
				sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
			}

			if (optionalPointOnRay) {
				optionalPointOnRay.copy(this.direction).multiplyScalar(s0).add(this.origin);
			}

			if (optionalPointOnSegment) {
				optionalPointOnSegment.copy(_segDir).multiplyScalar(s1).add(_segCenter);
			}

			return sqrDist;
		};

		_proto.intersectSphere = function intersectSphere(sphere, target) {
			_vector$2.subVectors(sphere.center, this.origin);

			var tca = _vector$2.dot(this.direction);

			var d2 = _vector$2.dot(_vector$2) - tca * tca;
			var radius2 = sphere.radius * sphere.radius;
			if (d2 > radius2) return null;
			var thc = Math.sqrt(radius2 - d2); // t0 = first intersect point - entrance on front of sphere

			var t0 = tca - thc; // t1 = second intersect point - exit point on back of sphere

			var t1 = tca + thc; // test to see if both t0 and t1 are behind the ray - if so, return null

			if (t0 < 0 && t1 < 0) return null; // test to see if t0 is behind the ray:
			// if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
			// in order to always return an intersect point that is in front of the ray.

			if (t0 < 0) return this.at(t1, target); // else t0 is in front of the ray, so return the first collision point scaled by t0

			return this.at(t0, target);
		};

		_proto.intersectsSphere = function intersectsSphere(sphere) {
			return this.distanceSqToPoint(sphere.center) <= sphere.radius * sphere.radius;
		};

		_proto.distanceToPlane = function distanceToPlane(plane) {
			var denominator = plane.normal.dot(this.direction);

			if (denominator === 0) {
				// line is coplanar, return origin
				if (plane.distanceToPoint(this.origin) === 0) {
					return 0;
				} // Null is preferable to undefined since undefined means.... it is undefined


				return null;
			}

			var t = -(this.origin.dot(plane.normal) + plane.constant) / denominator; // Return if the ray never intersects the plane

			return t >= 0 ? t : null;
		};

		_proto.intersectPlane = function intersectPlane(plane, target) {
			var t = this.distanceToPlane(plane);

			if (t === null) {
				return null;
			}

			return this.at(t, target);
		};

		_proto.intersectsPlane = function intersectsPlane(plane) {
			// check if the ray lies on the plane first
			var distToPoint = plane.distanceToPoint(this.origin);

			if (distToPoint === 0) {
				return true;
			}

			var denominator = plane.normal.dot(this.direction);

			if (denominator * distToPoint < 0) {
				return true;
			} // ray origin is behind the plane (and is pointing behind it)


			return false;
		};

		_proto.intersectBox = function intersectBox(box, target) {
			var tmin, tmax, tymin, tymax, tzmin, tzmax;
			var invdirx = 1 / this.direction.x,
					invdiry = 1 / this.direction.y,
					invdirz = 1 / this.direction.z;
			var origin = this.origin;

			if (invdirx >= 0) {
				tmin = (box.min.x - origin.x) * invdirx;
				tmax = (box.max.x - origin.x) * invdirx;
			} else {
				tmin = (box.max.x - origin.x) * invdirx;
				tmax = (box.min.x - origin.x) * invdirx;
			}

			if (invdiry >= 0) {
				tymin = (box.min.y - origin.y) * invdiry;
				tymax = (box.max.y - origin.y) * invdiry;
			} else {
				tymin = (box.max.y - origin.y) * invdiry;
				tymax = (box.min.y - origin.y) * invdiry;
			}

			if (tmin > tymax || tymin > tmax) return null; // These lines also handle the case where tmin or tmax is NaN
			// (result of 0 * Infinity). x !== x returns true if x is NaN

			if (tymin > tmin || tmin !== tmin) tmin = tymin;
			if (tymax < tmax || tmax !== tmax) tmax = tymax;

			if (invdirz >= 0) {
				tzmin = (box.min.z - origin.z) * invdirz;
				tzmax = (box.max.z - origin.z) * invdirz;
			} else {
				tzmin = (box.max.z - origin.z) * invdirz;
				tzmax = (box.min.z - origin.z) * invdirz;
			}

			if (tmin > tzmax || tzmin > tmax) return null;
			if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
			if (tzmax < tmax || tmax !== tmax) tmax = tzmax; //return point closest to the ray (positive side)

			if (tmax < 0) return null;
			return this.at(tmin >= 0 ? tmin : tmax, target);
		};

		_proto.intersectsBox = function intersectsBox(box) {
			return this.intersectBox(box, _vector$2) !== null;
		};

		_proto.intersectTriangle = function intersectTriangle(a, b, c, backfaceCulling, target) {
			// Compute the offset origin, edges, and normal.
			// from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h
			_edge1.subVectors(b, a);

			_edge2.subVectors(c, a);

			_normal.crossVectors(_edge1, _edge2); // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
			// E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
			//	 |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
			//	 |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
			//	 |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)


			var DdN = this.direction.dot(_normal);
			var sign;

			if (DdN > 0) {
				if (backfaceCulling) return null;
				sign = 1;
			} else if (DdN < 0) {
				sign = -1;
				DdN = -DdN;
			} else {
				return null;
			}

			_diff.subVectors(this.origin, a);

			var DdQxE2 = sign * this.direction.dot(_edge2.crossVectors(_diff, _edge2)); // b1 < 0, no intersection

			if (DdQxE2 < 0) {
				return null;
			}

			var DdE1xQ = sign * this.direction.dot(_edge1.cross(_diff)); // b2 < 0, no intersection

			if (DdE1xQ < 0) {
				return null;
			} // b1+b2 > 1, no intersection


			if (DdQxE2 + DdE1xQ > DdN) {
				return null;
			} // Line intersects triangle, check if ray does.


			var QdN = -sign * _diff.dot(_normal); // t < 0, no intersection


			if (QdN < 0) {
				return null;
			} // Ray intersects triangle.


			return this.at(QdN / DdN, target);
		};

		_proto.applyMatrix4 = function applyMatrix4(matrix4) {
			this.origin.applyMatrix4(matrix4);
			this.direction.transformDirection(matrix4);
			return this;
		};

		_proto.equals = function equals(ray) {
			return ray.origin.equals(this.origin) && ray.direction.equals(this.direction);
		};

		return Ray;
	}();

	var Matrix4 = /*#__PURE__*/function () {
		function Matrix4() {
			Object.defineProperty(this, 'isMatrix4', {
				value: true
			});
			this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

			if (arguments.length > 0) {
				console.error('THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.');
			}
		}

		var _proto = Matrix4.prototype;

		_proto.set = function set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
			var te = this.elements;
			te[0] = n11;
			te[4] = n12;
			te[8] = n13;
			te[12] = n14;
			te[1] = n21;
			te[5] = n22;
			te[9] = n23;
			te[13] = n24;
			te[2] = n31;
			te[6] = n32;
			te[10] = n33;
			te[14] = n34;
			te[3] = n41;
			te[7] = n42;
			te[11] = n43;
			te[15] = n44;
			return this;
		};

		_proto.identity = function identity() {
			this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
			return this;
		};

		_proto.clone = function clone() {
			return new Matrix4().fromArray(this.elements);
		};

		_proto.copy = function copy(m) {
			var te = this.elements;
			var me = m.elements;
			te[0] = me[0];
			te[1] = me[1];
			te[2] = me[2];
			te[3] = me[3];
			te[4] = me[4];
			te[5] = me[5];
			te[6] = me[6];
			te[7] = me[7];
			te[8] = me[8];
			te[9] = me[9];
			te[10] = me[10];
			te[11] = me[11];
			te[12] = me[12];
			te[13] = me[13];
			te[14] = me[14];
			te[15] = me[15];
			return this;
		};

		_proto.copyPosition = function copyPosition(m) {
			var te = this.elements,
					me = m.elements;
			te[12] = me[12];
			te[13] = me[13];
			te[14] = me[14];
			return this;
		};

		_proto.setFromMatrix3 = function setFromMatrix3(m) {
			var me = m.elements;
			this.set(me[0], me[3], me[6], 0, me[1], me[4], me[7], 0, me[2], me[5], me[8], 0, 0, 0, 0, 1);
			return this;
		};

		_proto.extractBasis = function extractBasis(xAxis, yAxis, zAxis) {
			xAxis.setFromMatrixColumn(this, 0);
			yAxis.setFromMatrixColumn(this, 1);
			zAxis.setFromMatrixColumn(this, 2);
			return this;
		};

		_proto.makeBasis = function makeBasis(xAxis, yAxis, zAxis) {
			this.set(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, 0, 0, 0, 1);
			return this;
		};

		_proto.extractRotation = function extractRotation(m) {
			// this method does not support reflection matrices
			var te = this.elements;
			var me = m.elements;

			var scaleX = 1 / _v1$1.setFromMatrixColumn(m, 0).length();

			var scaleY = 1 / _v1$1.setFromMatrixColumn(m, 1).length();

			var scaleZ = 1 / _v1$1.setFromMatrixColumn(m, 2).length();

			te[0] = me[0] * scaleX;
			te[1] = me[1] * scaleX;
			te[2] = me[2] * scaleX;
			te[3] = 0;
			te[4] = me[4] * scaleY;
			te[5] = me[5] * scaleY;
			te[6] = me[6] * scaleY;
			te[7] = 0;
			te[8] = me[8] * scaleZ;
			te[9] = me[9] * scaleZ;
			te[10] = me[10] * scaleZ;
			te[11] = 0;
			te[12] = 0;
			te[13] = 0;
			te[14] = 0;
			te[15] = 1;
			return this;
		};

		_proto.makeRotationFromEuler = function makeRotationFromEuler(euler) {
			if (!(euler && euler.isEuler)) {
				console.error('THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.');
			}

			var te = this.elements;
			var x = euler.x,
					y = euler.y,
					z = euler.z;
			var a = Math.cos(x),
					b = Math.sin(x);
			var c = Math.cos(y),
					d = Math.sin(y);
			var e = Math.cos(z),
					f = Math.sin(z);

			if (euler.order === 'XYZ') {
				var ae = a * e,
						af = a * f,
						be = b * e,
						bf = b * f;
				te[0] = c * e;
				te[4] = -c * f;
				te[8] = d;
				te[1] = af + be * d;
				te[5] = ae - bf * d;
				te[9] = -b * c;
				te[2] = bf - ae * d;
				te[6] = be + af * d;
				te[10] = a * c;
			} else if (euler.order === 'YXZ') {
				var ce = c * e,
						cf = c * f,
						de = d * e,
						df = d * f;
				te[0] = ce + df * b;
				te[4] = de * b - cf;
				te[8] = a * d;
				te[1] = a * f;
				te[5] = a * e;
				te[9] = -b;
				te[2] = cf * b - de;
				te[6] = df + ce * b;
				te[10] = a * c;
			} else if (euler.order === 'ZXY') {
				var _ce = c * e,
						_cf = c * f,
						_de = d * e,
						_df = d * f;

				te[0] = _ce - _df * b;
				te[4] = -a * f;
				te[8] = _de + _cf * b;
				te[1] = _cf + _de * b;
				te[5] = a * e;
				te[9] = _df - _ce * b;
				te[2] = -a * d;
				te[6] = b;
				te[10] = a * c;
			} else if (euler.order === 'ZYX') {
				var _ae = a * e,
						_af = a * f,
						_be = b * e,
						_bf = b * f;

				te[0] = c * e;
				te[4] = _be * d - _af;
				te[8] = _ae * d + _bf;
				te[1] = c * f;
				te[5] = _bf * d + _ae;
				te[9] = _af * d - _be;
				te[2] = -d;
				te[6] = b * c;
				te[10] = a * c;
			} else if (euler.order === 'YZX') {
				var ac = a * c,
						ad = a * d,
						bc = b * c,
						bd = b * d;
				te[0] = c * e;
				te[4] = bd - ac * f;
				te[8] = bc * f + ad;
				te[1] = f;
				te[5] = a * e;
				te[9] = -b * e;
				te[2] = -d * e;
				te[6] = ad * f + bc;
				te[10] = ac - bd * f;
			} else if (euler.order === 'XZY') {
				var _ac = a * c,
						_ad = a * d,
						_bc = b * c,
						_bd = b * d;

				te[0] = c * e;
				te[4] = -f;
				te[8] = d * e;
				te[1] = _ac * f + _bd;
				te[5] = a * e;
				te[9] = _ad * f - _bc;
				te[2] = _bc * f - _ad;
				te[6] = b * e;
				te[10] = _bd * f + _ac;
			} // bottom row


			te[3] = 0;
			te[7] = 0;
			te[11] = 0; // last column

			te[12] = 0;
			te[13] = 0;
			te[14] = 0;
			te[15] = 1;
			return this;
		};

		_proto.makeRotationFromQuaternion = function makeRotationFromQuaternion(q) {
			return this.compose(_zero, q, _one);
		};

		_proto.lookAt = function lookAt(eye, target, up) {
			var te = this.elements;

			_z.subVectors(eye, target);

			if (_z.lengthSq() === 0) {
				// eye and target are in the same position
				_z.z = 1;
			}

			_z.normalize();

			_x.crossVectors(up, _z);

			if (_x.lengthSq() === 0) {
				// up and z are parallel
				if (Math.abs(up.z) === 1) {
					_z.x += 0.0001;
				} else {
					_z.z += 0.0001;
				}

				_z.normalize();

				_x.crossVectors(up, _z);
			}

			_x.normalize();

			_y.crossVectors(_z, _x);

			te[0] = _x.x;
			te[4] = _y.x;
			te[8] = _z.x;
			te[1] = _x.y;
			te[5] = _y.y;
			te[9] = _z.y;
			te[2] = _x.z;
			te[6] = _y.z;
			te[10] = _z.z;
			return this;
		};

		_proto.multiply = function multiply(m, n) {
			if (n !== undefined) {
				console.warn('THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead.');
				return this.multiplyMatrices(m, n);
			}

			return this.multiplyMatrices(this, m);
		};

		_proto.premultiply = function premultiply(m) {
			return this.multiplyMatrices(m, this);
		};

		_proto.multiplyMatrices = function multiplyMatrices(a, b) {
			var ae = a.elements;
			var be = b.elements;
			var te = this.elements;
			var a11 = ae[0],
					a12 = ae[4],
					a13 = ae[8],
					a14 = ae[12];
			var a21 = ae[1],
					a22 = ae[5],
					a23 = ae[9],
					a24 = ae[13];
			var a31 = ae[2],
					a32 = ae[6],
					a33 = ae[10],
					a34 = ae[14];
			var a41 = ae[3],
					a42 = ae[7],
					a43 = ae[11],
					a44 = ae[15];
			var b11 = be[0],
					b12 = be[4],
					b13 = be[8],
					b14 = be[12];
			var b21 = be[1],
					b22 = be[5],
					b23 = be[9],
					b24 = be[13];
			var b31 = be[2],
					b32 = be[6],
					b33 = be[10],
					b34 = be[14];
			var b41 = be[3],
					b42 = be[7],
					b43 = be[11],
					b44 = be[15];
			te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
			te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
			te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
			te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
			te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
			te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
			te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
			te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
			te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
			te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
			te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
			te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
			te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
			te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
			te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
			te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
			return this;
		};

		_proto.multiplyScalar = function multiplyScalar(s) {
			var te = this.elements;
			te[0] *= s;
			te[4] *= s;
			te[8] *= s;
			te[12] *= s;
			te[1] *= s;
			te[5] *= s;
			te[9] *= s;
			te[13] *= s;
			te[2] *= s;
			te[6] *= s;
			te[10] *= s;
			te[14] *= s;
			te[3] *= s;
			te[7] *= s;
			te[11] *= s;
			te[15] *= s;
			return this;
		};

		_proto.determinant = function determinant() {
			var te = this.elements;
			var n11 = te[0],
					n12 = te[4],
					n13 = te[8],
					n14 = te[12];
			var n21 = te[1],
					n22 = te[5],
					n23 = te[9],
					n24 = te[13];
			var n31 = te[2],
					n32 = te[6],
					n33 = te[10],
					n34 = te[14];
			var n41 = te[3],
					n42 = te[7],
					n43 = te[11],
					n44 = te[15]; //TODO: make this more efficient
			//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

			return n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
		};

		_proto.transpose = function transpose() {
			var te = this.elements;
			var tmp;
			tmp = te[1];
			te[1] = te[4];
			te[4] = tmp;
			tmp = te[2];
			te[2] = te[8];
			te[8] = tmp;
			tmp = te[6];
			te[6] = te[9];
			te[9] = tmp;
			tmp = te[3];
			te[3] = te[12];
			te[12] = tmp;
			tmp = te[7];
			te[7] = te[13];
			te[13] = tmp;
			tmp = te[11];
			te[11] = te[14];
			te[14] = tmp;
			return this;
		};

		_proto.setPosition = function setPosition(x, y, z) {
			var te = this.elements;

			if (x.isVector3) {
				te[12] = x.x;
				te[13] = x.y;
				te[14] = x.z;
			} else {
				te[12] = x;
				te[13] = y;
				te[14] = z;
			}

			return this;
		};

		_proto.invert = function invert() {
			// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
			var te = this.elements,
					n11 = te[0],
					n21 = te[1],
					n31 = te[2],
					n41 = te[3],
					n12 = te[4],
					n22 = te[5],
					n32 = te[6],
					n42 = te[7],
					n13 = te[8],
					n23 = te[9],
					n33 = te[10],
					n43 = te[11],
					n14 = te[12],
					n24 = te[13],
					n34 = te[14],
					n44 = te[15],
					t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
					t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
					t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
					t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
			var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
			if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
			var detInv = 1 / det;
			te[0] = t11 * detInv;
			te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
			te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
			te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;
			te[4] = t12 * detInv;
			te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
			te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
			te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;
			te[8] = t13 * detInv;
			te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
			te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
			te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;
			te[12] = t14 * detInv;
			te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
			te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
			te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
			return this;
		};

		_proto.scale = function scale(v) {
			var te = this.elements;
			var x = v.x,
					y = v.y,
					z = v.z;
			te[0] *= x;
			te[4] *= y;
			te[8] *= z;
			te[1] *= x;
			te[5] *= y;
			te[9] *= z;
			te[2] *= x;
			te[6] *= y;
			te[10] *= z;
			te[3] *= x;
			te[7] *= y;
			te[11] *= z;
			return this;
		};

		_proto.getMaxScaleOnAxis = function getMaxScaleOnAxis() {
			var te = this.elements;
			var scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
			var scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
			var scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
			return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
		};

		_proto.makeTranslation = function makeTranslation(x, y, z) {
			this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
			return this;
		};

		_proto.makeRotationX = function makeRotationX(theta) {
			var c = Math.cos(theta),
					s = Math.sin(theta);
			this.set(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);
			return this;
		};

		_proto.makeRotationY = function makeRotationY(theta) {
			var c = Math.cos(theta),
					s = Math.sin(theta);
			this.set(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);
			return this;
		};

		_proto.makeRotationZ = function makeRotationZ(theta) {
			var c = Math.cos(theta),
					s = Math.sin(theta);
			this.set(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
			return this;
		};

		_proto.makeRotationAxis = function makeRotationAxis(axis, angle) {
			// Based on http://www.gamedev.net/reference/articles/article1199.asp
			var c = Math.cos(angle);
			var s = Math.sin(angle);
			var t = 1 - c;
			var x = axis.x,
					y = axis.y,
					z = axis.z;
			var tx = t * x,
					ty = t * y;
			this.set(tx * x + c, tx * y - s * z, tx * z + s * y, 0, tx * y + s * z, ty * y + c, ty * z - s * x, 0, tx * z - s * y, ty * z + s * x, t * z * z + c, 0, 0, 0, 0, 1);
			return this;
		};

		_proto.makeScale = function makeScale(x, y, z) {
			this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
			return this;
		};

		_proto.makeShear = function makeShear(x, y, z) {
			this.set(1, y, z, 0, x, 1, z, 0, x, y, 1, 0, 0, 0, 0, 1);
			return this;
		};

		_proto.compose = function compose(position, quaternion, scale) {
			var te = this.elements;
			var x = quaternion._x,
					y = quaternion._y,
					z = quaternion._z,
					w = quaternion._w;
			var x2 = x + x,
					y2 = y + y,
					z2 = z + z;
			var xx = x * x2,
					xy = x * y2,
					xz = x * z2;
			var yy = y * y2,
					yz = y * z2,
					zz = z * z2;
			var wx = w * x2,
					wy = w * y2,
					wz = w * z2;
			var sx = scale.x,
					sy = scale.y,
					sz = scale.z;
			te[0] = (1 - (yy + zz)) * sx;
			te[1] = (xy + wz) * sx;
			te[2] = (xz - wy) * sx;
			te[3] = 0;
			te[4] = (xy - wz) * sy;
			te[5] = (1 - (xx + zz)) * sy;
			te[6] = (yz + wx) * sy;
			te[7] = 0;
			te[8] = (xz + wy) * sz;
			te[9] = (yz - wx) * sz;
			te[10] = (1 - (xx + yy)) * sz;
			te[11] = 0;
			te[12] = position.x;
			te[13] = position.y;
			te[14] = position.z;
			te[15] = 1;
			return this;
		};

		_proto.decompose = function decompose(position, quaternion, scale) {
			var te = this.elements;

			var sx = _v1$1.set(te[0], te[1], te[2]).length();

			var sy = _v1$1.set(te[4], te[5], te[6]).length();

			var sz = _v1$1.set(te[8], te[9], te[10]).length(); // if determine is negative, we need to invert one scale


			var det = this.determinant();
			if (det < 0) sx = -sx;
			position.x = te[12];
			position.y = te[13];
			position.z = te[14]; // scale the rotation part

			_m1.copy(this);

			var invSX = 1 / sx;
			var invSY = 1 / sy;
			var invSZ = 1 / sz;
			_m1.elements[0] *= invSX;
			_m1.elements[1] *= invSX;
			_m1.elements[2] *= invSX;
			_m1.elements[4] *= invSY;
			_m1.elements[5] *= invSY;
			_m1.elements[6] *= invSY;
			_m1.elements[8] *= invSZ;
			_m1.elements[9] *= invSZ;
			_m1.elements[10] *= invSZ;
			quaternion.setFromRotationMatrix(_m1);
			scale.x = sx;
			scale.y = sy;
			scale.z = sz;
			return this;
		};

		_proto.makePerspective = function makePerspective(left, right, top, bottom, near, far) {
			if (far === undefined) {
				console.warn('THREE.Matrix4: .makePerspective() has been redefined and has a new signature. Please check the docs.');
			}

			var te = this.elements;
			var x = 2 * near / (right - left);
			var y = 2 * near / (top - bottom);
			var a = (right + left) / (right - left);
			var b = (top + bottom) / (top - bottom);
			var c = -(far + near) / (far - near);
			var d = -2 * far * near / (far - near);
			te[0] = x;
			te[4] = 0;
			te[8] = a;
			te[12] = 0;
			te[1] = 0;
			te[5] = y;
			te[9] = b;
			te[13] = 0;
			te[2] = 0;
			te[6] = 0;
			te[10] = c;
			te[14] = d;
			te[3] = 0;
			te[7] = 0;
			te[11] = -1;
			te[15] = 0;
			return this;
		};

		_proto.makeOrthographic = function makeOrthographic(left, right, top, bottom, near, far) {
			var te = this.elements;
			var w = 1.0 / (right - left);
			var h = 1.0 / (top - bottom);
			var p = 1.0 / (far - near);
			var x = (right + left) * w;
			var y = (top + bottom) * h;
			var z = (far + near) * p;
			te[0] = 2 * w;
			te[4] = 0;
			te[8] = 0;
			te[12] = -x;
			te[1] = 0;
			te[5] = 2 * h;
			te[9] = 0;
			te[13] = -y;
			te[2] = 0;
			te[6] = 0;
			te[10] = -2 * p;
			te[14] = -z;
			te[3] = 0;
			te[7] = 0;
			te[11] = 0;
			te[15] = 1;
			return this;
		};

		_proto.equals = function equals(matrix) {
			var te = this.elements;
			var me = matrix.elements;

			for (var i = 0; i < 16; i++) {
				if (te[i] !== me[i]) return false;
			}

			return true;
		};

		_proto.fromArray = function fromArray(array, offset) {
			if (offset === void 0) {
				offset = 0;
			}

			for (var i = 0; i < 16; i++) {
				this.elements[i] = array[i + offset];
			}

			return this;
		};

		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}

			if (offset === void 0) {
				offset = 0;
			}

			var te = this.elements;
			array[offset] = te[0];
			array[offset + 1] = te[1];
			array[offset + 2] = te[2];
			array[offset + 3] = te[3];
			array[offset + 4] = te[4];
			array[offset + 5] = te[5];
			array[offset + 6] = te[6];
			array[offset + 7] = te[7];
			array[offset + 8] = te[8];
			array[offset + 9] = te[9];
			array[offset + 10] = te[10];
			array[offset + 11] = te[11];
			array[offset + 12] = te[12];
			array[offset + 13] = te[13];
			array[offset + 14] = te[14];
			array[offset + 15] = te[15];
			return array;
		};

		return Matrix4;
	}();

	var _v1$1 = /*@__PURE__*/new Vector3();

	var _m1 = /*@__PURE__*/new Matrix4();

	var _zero = /*@__PURE__*/new Vector3(0, 0, 0);

	var _one = /*@__PURE__*/new Vector3(1, 1, 1);

	var _x = /*@__PURE__*/new Vector3();

	var _y = /*@__PURE__*/new Vector3();

	var _z = /*@__PURE__*/new Vector3();

	var Euler = /*#__PURE__*/function () {
		function Euler(x, y, z, order) {
			if (x === void 0) {
				x = 0;
			}

			if (y === void 0) {
				y = 0;
			}

			if (z === void 0) {
				z = 0;
			}

			if (order === void 0) {
				order = Euler.DefaultOrder;
			}

			Object.defineProperty(this, 'isEuler', {
				value: true
			});
			this._x = x;
			this._y = y;
			this._z = z;
			this._order = order;
		}

		var _proto = Euler.prototype;

		_proto.set = function set(x, y, z, order) {
			this._x = x;
			this._y = y;
			this._z = z;
			this._order = order || this._order;

			this._onChangeCallback();

			return this;
		};

		_proto.clone = function clone() {
			return new this.constructor(this._x, this._y, this._z, this._order);
		};

		_proto.copy = function copy(euler) {
			this._x = euler._x;
			this._y = euler._y;
			this._z = euler._z;
			this._order = euler._order;

			this._onChangeCallback();

			return this;
		};

		_proto.setFromRotationMatrix = function setFromRotationMatrix(m, order, update) {
			var clamp = MathUtils.clamp; // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

			var te = m.elements;
			var m11 = te[0],
					m12 = te[4],
					m13 = te[8];
			var m21 = te[1],
					m22 = te[5],
					m23 = te[9];
			var m31 = te[2],
					m32 = te[6],
					m33 = te[10];
			order = order || this._order;

			switch (order) {
				case 'XYZ':
					this._y = Math.asin(clamp(m13, -1, 1));

					if (Math.abs(m13) < 0.9999999) {
						this._x = Math.atan2(-m23, m33);
						this._z = Math.atan2(-m12, m11);
					} else {
						this._x = Math.atan2(m32, m22);
						this._z = 0;
					}

					break;

				case 'YXZ':
					this._x = Math.asin(-clamp(m23, -1, 1));

					if (Math.abs(m23) < 0.9999999) {
						this._y = Math.atan2(m13, m33);
						this._z = Math.atan2(m21, m22);
					} else {
						this._y = Math.atan2(-m31, m11);
						this._z = 0;
					}

					break;

				case 'ZXY':
					this._x = Math.asin(clamp(m32, -1, 1));

					if (Math.abs(m32) < 0.9999999) {
						this._y = Math.atan2(-m31, m33);
						this._z = Math.atan2(-m12, m22);
					} else {
						this._y = 0;
						this._z = Math.atan2(m21, m11);
					}

					break;

				case 'ZYX':
					this._y = Math.asin(-clamp(m31, -1, 1));

					if (Math.abs(m31) < 0.9999999) {
						this._x = Math.atan2(m32, m33);
						this._z = Math.atan2(m21, m11);
					} else {
						this._x = 0;
						this._z = Math.atan2(-m12, m22);
					}

					break;

				case 'YZX':
					this._z = Math.asin(clamp(m21, -1, 1));

					if (Math.abs(m21) < 0.9999999) {
						this._x = Math.atan2(-m23, m22);
						this._y = Math.atan2(-m31, m11);
					} else {
						this._x = 0;
						this._y = Math.atan2(m13, m33);
					}

					break;

				case 'XZY':
					this._z = Math.asin(-clamp(m12, -1, 1));

					if (Math.abs(m12) < 0.9999999) {
						this._x = Math.atan2(m32, m22);
						this._y = Math.atan2(m13, m11);
					} else {
						this._x = Math.atan2(-m23, m33);
						this._y = 0;
					}

					break;

				default:
					console.warn('THREE.Euler: .setFromRotationMatrix() encountered an unknown order: ' + order);
			}

			this._order = order;
			if (update !== false) this._onChangeCallback();
			return this;
		};

		_proto.setFromQuaternion = function setFromQuaternion(q, order, update) {
			_matrix.makeRotationFromQuaternion(q);

			return this.setFromRotationMatrix(_matrix, order, update);
		};

		_proto.setFromVector3 = function setFromVector3(v, order) {
			return this.set(v.x, v.y, v.z, order || this._order);
		};

		_proto.reorder = function reorder(newOrder) {
			// WARNING: this discards revolution information -bhouston
			_quaternion$1.setFromEuler(this);

			return this.setFromQuaternion(_quaternion$1, newOrder);
		};

		_proto.equals = function equals(euler) {
			return euler._x === this._x && euler._y === this._y && euler._z === this._z && euler._order === this._order;
		};

		_proto.fromArray = function fromArray(array) {
			this._x = array[0];
			this._y = array[1];
			this._z = array[2];
			if (array[3] !== undefined) this._order = array[3];

			this._onChangeCallback();

			return this;
		};

		_proto.toArray = function toArray(array, offset) {
			if (array === void 0) {
				array = [];
			}

			if (offset === void 0) {
				offset = 0;
			}

			array[offset] = this._x;
			array[offset + 1] = this._y;
			array[offset + 2] = this._z;
			array[offset + 3] = this._order;
			return array;
		};

		_proto.toVector3 = function toVector3(optionalResult) {
			if (optionalResult) {
				return optionalResult.set(this._x, this._y, this._z);
			} else {
				return new Vector3(this._x, this._y, this._z);
			}
		};

		_proto._onChange = function _onChange(callback) {
			this._onChangeCallback = callback;
			return this;
		};

		_proto._onChangeCallback = function _onChangeCallback() {};

		_createClass(Euler, [{
			key: "x",
			get: function get() {
				return this._x;
			},
			set: function set(value) {
				this._x = value;

				this._onChangeCallback();
			}
		}, {
			key: "y",
			get: function get() {
				return this._y;
			},
			set: function set(value) {
				this._y = value;

				this._onChangeCallback();
			}
		}, {
			key: "z",
			get: function get() {
				return this._z;
			},
			set: function set(value) {
				this._z = value;

				this._onChangeCallback();
			}
		}, {
			key: "order",
			get: function get() {
				return this._order;
			},
			set: function set(value) {
				this._order = value;

				this._onChangeCallback();
			}
		}]);

		return Euler;
	}();

	Euler.DefaultOrder = 'XYZ';
	Euler.RotationOrders = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'];

	var _matrix = /*@__PURE__*/new Matrix4();

	var _quaternion$1 = /*@__PURE__*/new Quaternion();

	var Layers = /*#__PURE__*/function () {
		function Layers() {
			this.mask = 1 | 0;
		}

		var _proto = Layers.prototype;

		_proto.set = function set(channel) {
			this.mask = 1 << channel | 0;
		};

		_proto.enable = function enable(channel) {
			this.mask |= 1 << channel | 0;
		};

		_proto.enableAll = function enableAll() {
			this.mask = 0xffffffff | 0;
		};

		_proto.toggle = function toggle(channel) {
			this.mask ^= 1 << channel | 0;
		};

		_proto.disable = function disable(channel) {
			this.mask &= ~(1 << channel | 0);
		};

		_proto.disableAll = function disableAll() {
			this.mask = 0;
		};

		_proto.test = function test(layers) {
			return (this.mask & layers.mask) !== 0;
		};

		return Layers;
	}();

	var _object3DId = 0;

	var _v1$2 = new Vector3();

	var _q1 = new Quaternion();

	var _m1$1 = new Matrix4();

	var _target = new Vector3();

	var _position = new Vector3();

	var _scale = new Vector3();

	var _quaternion$2 = new Quaternion();

	var _xAxis = new Vector3(1, 0, 0);

	var _yAxis = new Vector3(0, 1, 0);

	var _zAxis = new Vector3(0, 0, 1);

	var _addedEvent = {
		type: 'added'
	};
	var _removedEvent = {
		type: 'removed'
	};

	function Object3D() {
		Object.defineProperty(this, 'id', {
			value: _object3DId++
		});
		this.uuid = MathUtils.generateUUID();
		this.name = '';
		this.type = 'Object3D';
		this.parent = null;
		this.children = [];
		this.up = Object3D.DefaultUp.clone();
		var position = new Vector3();
		var rotation = new Euler();
		var quaternion = new Quaternion();
		var scale = new Vector3(1, 1, 1);

		function onRotationChange() {
			quaternion.setFromEuler(rotation, false);
		}

		function onQuaternionChange() {
			rotation.setFromQuaternion(quaternion, undefined, false);
		}

		rotation._onChange(onRotationChange);

		quaternion._onChange(onQuaternionChange);

		Object.defineProperties(this, {
			position: {
				configurable: true,
				enumerable: true,
				value: position
			},
			rotation: {
				configurable: true,
				enumerable: true,
				value: rotation
			},
			quaternion: {
				configurable: true,
				enumerable: true,
				value: quaternion
			},
			scale: {
				configurable: true,
				enumerable: true,
				value: scale
			},
			modelViewMatrix: {
				value: new Matrix4()
			},
			normalMatrix: {
				value: new Matrix3()
			}
		});
		this.matrix = new Matrix4();
		this.matrixWorld = new Matrix4();
		this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
		this.matrixWorldNeedsUpdate = false;
		this.layers = new Layers();
		this.visible = true;
		this.castShadow = false;
		this.receiveShadow = false;
		this.frustumCulled = true;
		this.renderOrder = 0;
		this.animations = [];
		this.userData = {};
	}

	Object3D.DefaultUp = new Vector3(0, 1, 0);
	Object3D.DefaultMatrixAutoUpdate = true;
	Object3D.prototype = Object.assign(Object.create(EventDispatcher.prototype), {
		constructor: Object3D,
		isObject3D: true,
		onBeforeRender: function onBeforeRender() {},
		onAfterRender: function onAfterRender() {},
		applyMatrix4: function applyMatrix4(matrix) {
			if (this.matrixAutoUpdate) this.updateMatrix();
			this.matrix.premultiply(matrix);
			this.matrix.decompose(this.position, this.quaternion, this.scale);
		},
		applyQuaternion: function applyQuaternion(q) {
			this.quaternion.premultiply(q);
			return this;
		},
		setRotationFromAxisAngle: function setRotationFromAxisAngle(axis, angle) {
			// assumes axis is normalized
			this.quaternion.setFromAxisAngle(axis, angle);
		},
		setRotationFromEuler: function setRotationFromEuler(euler) {
			this.quaternion.setFromEuler(euler, true);
		},
		setRotationFromMatrix: function setRotationFromMatrix(m) {
			// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
			this.quaternion.setFromRotationMatrix(m);
		},
		setRotationFromQuaternion: function setRotationFromQuaternion(q) {
			// assumes q is normalized
			this.quaternion.copy(q);
		},
		rotateOnAxis: function rotateOnAxis(axis, angle) {
			// rotate object on axis in object space
			// axis is assumed to be normalized
			_q1.setFromAxisAngle(axis, angle);

			this.quaternion.multiply(_q1);
			return this;
		},
		rotateOnWorldAxis: function rotateOnWorldAxis(axis, angle) {
			// rotate object on axis in world space
			// axis is assumed to be normalized
			// method assumes no rotated parent
			_q1.setFromAxisAngle(axis, angle);

			this.quaternion.premultiply(_q1);
			return this;
		},
		rotateX: function rotateX(angle) {
			return this.rotateOnAxis(_xAxis, angle);
		},
		rotateY: function rotateY(angle) {
			return this.rotateOnAxis(_yAxis, angle);
		},
		rotateZ: function rotateZ(angle) {
			return this.rotateOnAxis(_zAxis, angle);
		},
		translateOnAxis: function translateOnAxis(axis, distance) {
			// translate object by distance along axis in object space
			// axis is assumed to be normalized
			_v1$2.copy(axis).applyQuaternion(this.quaternion);

			this.position.add(_v1$2.multiplyScalar(distance));
			return this;
		},
		translateX: function translateX(distance) {
			return this.translateOnAxis(_xAxis, distance);
		},
		translateY: function translateY(distance) {
			return this.translateOnAxis(_yAxis, distance);
		},
		translateZ: function translateZ(distance) {
			return this.translateOnAxis(_zAxis, distance);
		},
		localToWorld: function localToWorld(vector) {
			return vector.applyMatrix4(this.matrixWorld);
		},
		worldToLocal: function worldToLocal(vector) {
			return vector.applyMatrix4(_m1$1.copy(this.matrixWorld).invert());
		},
		lookAt: function lookAt(x, y, z) {
			// This method does not support objects having non-uniformly-scaled parent(s)
			if (x.isVector3) {
				_target.copy(x);
			} else {
				_target.set(x, y, z);
			}

			var parent = this.parent;
			this.updateWorldMatrix(true, false);

			_position.setFromMatrixPosition(this.matrixWorld);

			if (this.isCamera || this.isLight) {
				_m1$1.lookAt(_position, _target, this.up);
			} else {
				_m1$1.lookAt(_target, _position, this.up);
			}

			this.quaternion.setFromRotationMatrix(_m1$1);

			if (parent) {
				_m1$1.extractRotation(parent.matrixWorld);

				_q1.setFromRotationMatrix(_m1$1);

				this.quaternion.premultiply(_q1.invert());
			}
		},
		add: function add(object) {
			if (arguments.length > 1) {
				for (var i = 0; i < arguments.length; i++) {
					this.add(arguments[i]);
				}

				return this;
			}

			if (object === this) {
				console.error('THREE.Object3D.add: object can\'t be added as a child of itself.', object);
				return this;
			}

			if (object && object.isObject3D) {
				if (object.parent !== null) {
					object.parent.remove(object);
				}

				object.parent = this;
				this.children.push(object);
				object.dispatchEvent(_addedEvent);
			} else {
				console.error('THREE.Object3D.add: object not an instance of THREE.Object3D.', object);
			}

			return this;
		},
		remove: function remove(object) {
			if (arguments.length > 1) {
				for (var i = 0; i < arguments.length; i++) {
					this.remove(arguments[i]);
				}

				return this;
			}

			var index = this.children.indexOf(object);

			if (index !== -1) {
				object.parent = null;
				this.children.splice(index, 1);
				object.dispatchEvent(_removedEvent);
			}

			return this;
		},
		clear: function clear() {
			for (var i = 0; i < this.children.length; i++) {
				var object = this.children[i];
				object.parent = null;
				object.dispatchEvent(_removedEvent);
			}

			this.children.length = 0;
			return this;
		},
		attach: function attach(object) {
			// adds object as a child of this, while maintaining the object's world transform
			this.updateWorldMatrix(true, false);

			_m1$1.copy(this.matrixWorld).invert();

			if (object.parent !== null) {
				object.parent.updateWorldMatrix(true, false);

				_m1$1.multiply(object.parent.matrixWorld);
			}

			object.applyMatrix4(_m1$1);
			object.updateWorldMatrix(false, false);
			this.add(object);
			return this;
		},
		getObjectById: function getObjectById(id) {
			return this.getObjectByProperty('id', id);
		},
		getObjectByName: function getObjectByName(name) {
			return this.getObjectByProperty('name', name);
		},
		getObjectByProperty: function getObjectByProperty(name, value) {
			if (this[name] === value) return this;

			for (var i = 0, l = this.children.length; i < l; i++) {
				var child = this.children[i];
				var object = child.getObjectByProperty(name, value);

				if (object !== undefined) {
					return object;
				}
			}

			return undefined;
		},
		getWorldPosition: function getWorldPosition(target) {
			if (target === undefined) {
				console.warn('THREE.Object3D: .getWorldPosition() target is now required');
				target = new Vector3();
			}

			this.updateWorldMatrix(true, false);
			return target.setFromMatrixPosition(this.matrixWorld);
		},
		getWorldQuaternion: function getWorldQuaternion(target) {
			if (target === undefined) {
				console.warn('THREE.Object3D: .getWorldQuaternion() target is now required');
				target = new Quaternion();
			}

			this.updateWorldMatrix(true, false);
			this.matrixWorld.decompose(_position, target, _scale);
			return target;
		},
		getWorldScale: function getWorldScale(target) {
			if (target === undefined) {
				console.warn('THREE.Object3D: .getWorldScale() target is now required');
				target = new Vector3();
			}

			this.updateWorldMatrix(true, false);
			this.matrixWorld.decompose(_position, _quaternion$2, target);
			return target;
		},
		getWorldDirection: function getWorldDirection(target) {
			if (target === undefined) {
				console.warn('THREE.Object3D: .getWorldDirection() target is now required');
				target = new Vector3();
			}

			this.updateWorldMatrix(true, false);
			var e = this.matrixWorld.elements;
			return target.set(e[8], e[9], e[10]).normalize();
		},
		raycast: function raycast() {},
		traverse: function traverse(callback) {
			callback(this);
			var children = this.children;

			for (var i = 0, l = children.length; i < l; i++) {
				children[i].traverse(callback);
			}
		},
		traverseVisible: function traverseVisible(callback) {
			if (this.visible === false) return;
			callback(this);
			var children = this.children;

			for (var i = 0, l = children.length; i < l; i++) {
				children[i].traverseVisible(callback);
			}
		},
		traverseAncestors: function traverseAncestors(callback) {
			var parent = this.parent;

			if (parent !== null) {
				callback(parent);
				parent.traverseAncestors(callback);
			}
		},
		updateMatrix: function updateMatrix() {
			this.matrix.compose(this.position, this.quaternion, this.scale);
			this.matrixWorldNeedsUpdate = true;
		},
		updateMatrixWorld: function updateMatrixWorld(force) {
			if (this.matrixAutoUpdate) this.updateMatrix();

			if (this.matrixWorldNeedsUpdate || force) {
				if (this.parent === null) {
					this.matrixWorld.copy(this.matrix);
				} else {
					this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
				}

				this.matrixWorldNeedsUpdate = false;
				force = true;
			} // update children


			var children = this.children;

			for (var i = 0, l = children.length; i < l; i++) {
				children[i].updateMatrixWorld(force);
			}
		},
		updateWorldMatrix: function updateWorldMatrix(updateParents, updateChildren) {
			var parent = this.parent;

			if (updateParents === true && parent !== null) {
				parent.updateWorldMatrix(true, false);
			}

			if (this.matrixAutoUpdate) this.updateMatrix();

			if (this.parent === null) {
				this.matrixWorld.copy(this.matrix);
			} else {
				this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
			} // update children


			if (updateChildren === true) {
				var children = this.children;

				for (var i = 0, l = children.length; i < l; i++) {
					children[i].updateWorldMatrix(false, true);
				}
			}
		},
		toJSON: function toJSON(meta) {
			// meta is a string when called from JSON.stringify
			var isRootObject = meta === undefined || typeof meta === 'string';
			var output = {}; // meta is a hash used to collect geometries, materials.
			// not providing it implies that this is the root object
			// being serialized.

			if (isRootObject) {
				// initialize meta obj
				meta = {
					geometries: {},
					materials: {},
					textures: {},
					images: {},
					shapes: {},
					skeletons: {},
					animations: {}
				};
				output.metadata = {
					version: 4.5,
					type: 'Object',
					generator: 'Object3D.toJSON'
				};
			} // standard Object3D serialization


			var object = {};
			object.uuid = this.uuid;
			object.type = this.type;
			if (this.name !== '') object.name = this.name;
			if (this.castShadow === true) object.castShadow = true;
			if (this.receiveShadow === true) object.receiveShadow = true;
			if (this.visible === false) object.visible = false;
			if (this.frustumCulled === false) object.frustumCulled = false;
			if (this.renderOrder !== 0) object.renderOrder = this.renderOrder;
			if (JSON.stringify(this.userData) !== '{}') object.userData = this.userData;
			object.layers = this.layers.mask;
			object.matrix = this.matrix.toArray();
			if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false; // object specific properties

			if (this.isInstancedMesh) {
				object.type = 'InstancedMesh';
				object.count = this.count;
				object.instanceMatrix = this.instanceMatrix.toJSON();
			} //


			function serialize(library, element) {
				if (library[element.uuid] === undefined) {
					library[element.uuid] = element.toJSON(meta);
				}

				return element.uuid;
			}

			if (this.isMesh || this.isLine || this.isPoints) {
				object.geometry = serialize(meta.geometries, this.geometry);
				var parameters = this.geometry.parameters;

				if (parameters !== undefined && parameters.shapes !== undefined) {
					var shapes = parameters.shapes;

					if (Array.isArray(shapes)) {
						for (var i = 0, l = shapes.length; i < l; i++) {
							var shape = shapes[i];
							serialize(meta.shapes, shape);
						}
					} else {
						serialize(meta.shapes, shapes);
					}
				}
			}

			if (this.isSkinnedMesh) {
				object.bindMode = this.bindMode;
				object.bindMatrix = this.bindMatrix.toArray();

				if (this.skeleton !== undefined) {
					serialize(meta.skeletons, this.skeleton);
					object.skeleton = this.skeleton.uuid;
				}
			}

			if (this.material !== undefined) {
				if (Array.isArray(this.material)) {
					var uuids = [];

					for (var _i = 0, _l = this.material.length; _i < _l; _i++) {
						uuids.push(serialize(meta.materials, this.material[_i]));
					}

					object.material = uuids;
				} else {
					object.material = serialize(meta.materials, this.material);
				}
			} //


			if (this.children.length > 0) {
				object.children = [];

				for (var _i2 = 0; _i2 < this.children.length; _i2++) {
					object.children.push(this.children[_i2].toJSON(meta).object);
				}
			} //


			if (this.animations.length > 0) {
				object.animations = [];

				for (var _i3 = 0; _i3 < this.animations.length; _i3++) {
					var animation = this.animations[_i3];
					object.animations.push(serialize(meta.animations, animation));
				}
			}

			if (isRootObject) {
				var geometries = extractFromCache(meta.geometries);
				var materials = extractFromCache(meta.materials);
				var textures = extractFromCache(meta.textures);
				var images = extractFromCache(meta.images);

				var _shapes = extractFromCache(meta.shapes);

				var skeletons = extractFromCache(meta.skeletons);
				var animations = extractFromCache(meta.animations);
				if (geometries.length > 0) output.geometries = geometries;
				if (materials.length > 0) output.materials = materials;
				if (textures.length > 0) output.textures = textures;
				if (images.length > 0) output.images = images;
				if (_shapes.length > 0) output.shapes = _shapes;
				if (skeletons.length > 0) output.skeletons = skeletons;
				if (animations.length > 0) output.animations = animations;
			}

			output.object = object;
			return output; // extract data from the cache hash
			// remove metadata on each item
			// and return as array

			function extractFromCache(cache) {
				var values = [];

				for (var key in cache) {
					var data = cache[key];
					delete data.metadata;
					values.push(data);
				}

				return values;
			}
		},
		clone: function clone(recursive) {
			return new this.constructor().copy(this, recursive);
		},
		copy: function copy(source, recursive) {
			if (recursive === void 0) {
				recursive = true;
			}

			this.name = source.name;
			this.up.copy(source.up);
			this.position.copy(source.position);
			this.rotation.order = source.rotation.order;
			this.quaternion.copy(source.quaternion);
			this.scale.copy(source.scale);
			this.matrix.copy(source.matrix);
			this.matrixWorld.copy(source.matrixWorld);
			this.matrixAutoUpdate = source.matrixAutoUpdate;
			this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;
			this.layers.mask = source.layers.mask;
			this.visible = source.visible;
			this.castShadow = source.castShadow;
			this.receiveShadow = source.receiveShadow;
			this.frustumCulled = source.frustumCulled;
			this.renderOrder = source.renderOrder;
			this.userData = JSON.parse(JSON.stringify(source.userData));

			if (recursive === true) {
				for (var i = 0; i < source.children.length; i++) {
					var child = source.children[i];
					this.add(child.clone());
				}
			}

			return this;
		}
	});

	var _vector1 = /*@__PURE__*/new Vector3();

	var _vector2 = /*@__PURE__*/new Vector3();

	var _normalMatrix = /*@__PURE__*/new Matrix3();

	var Plane = /*#__PURE__*/function () {
		function Plane(normal, constant) {
			Object.defineProperty(this, 'isPlane', {
				value: true
			}); // normal is assumed to be normalized

			this.normal = normal !== undefined ? normal : new Vector3(1, 0, 0);
			this.constant = constant !== undefined ? constant : 0;
		}

		var _proto = Plane.prototype;

		_proto.set = function set(normal, constant) {
			this.normal.copy(normal);
			this.constant = constant;
			return this;
		};

		_proto.setComponents = function setComponents(x, y, z, w) {
			this.normal.set(x, y, z);
			this.constant = w;
			return this;
		};

		_proto.setFromNormalAndCoplanarPoint = function setFromNormalAndCoplanarPoint(normal, point) {
			this.normal.copy(normal);
			this.constant = -point.dot(this.normal);
			return this;
		};

		_proto.setFromCoplanarPoints = function setFromCoplanarPoints(a, b, c) {
			var normal = _vector1.subVectors(c, b).cross(_vector2.subVectors(a, b)).normalize(); // Q: should an error be thrown if normal is zero (e.g. degenerate plane)?


			this.setFromNormalAndCoplanarPoint(normal, a);
			return this;
		};

		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		};

		_proto.copy = function copy(plane) {
			this.normal.copy(plane.normal);
			this.constant = plane.constant;
			return this;
		};

		_proto.normalize = function normalize() {
			// Note: will lead to a divide by zero if the plane is invalid.
			var inverseNormalLength = 1.0 / this.normal.length();
			this.normal.multiplyScalar(inverseNormalLength);
			this.constant *= inverseNormalLength;
			return this;
		};

		_proto.negate = function negate() {
			this.constant *= -1;
			this.normal.negate();
			return this;
		};

		_proto.distanceToPoint = function distanceToPoint(point) {
			return this.normal.dot(point) + this.constant;
		};

		_proto.distanceToSphere = function distanceToSphere(sphere) {
			return this.distanceToPoint(sphere.center) - sphere.radius;
		};

		_proto.projectPoint = function projectPoint(point, target) {
			if (target === undefined) {
				console.warn('THREE.Plane: .projectPoint() target is now required');
				target = new Vector3();
			}

			return target.copy(this.normal).multiplyScalar(-this.distanceToPoint(point)).add(point);
		};

		_proto.intersectLine = function intersectLine(line, target) {
			if (target === undefined) {
				console.warn('THREE.Plane: .intersectLine() target is now required');
				target = new Vector3();
			}

			var direction = line.delta(_vector1);
			var denominator = this.normal.dot(direction);

			if (denominator === 0) {
				// line is coplanar, return origin
				if (this.distanceToPoint(line.start) === 0) {
					return target.copy(line.start);
				} // Unsure if this is the correct method to handle this case.


				return undefined;
			}

			var t = -(line.start.dot(this.normal) + this.constant) / denominator;

			if (t < 0 || t > 1) {
				return undefined;
			}

			return target.copy(direction).multiplyScalar(t).add(line.start);
		};

		_proto.intersectsLine = function intersectsLine(line) {
			// Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.
			var startSign = this.distanceToPoint(line.start);
			var endSign = this.distanceToPoint(line.end);
			return startSign < 0 && endSign > 0 || endSign < 0 && startSign > 0;
		};

		_proto.intersectsBox = function intersectsBox(box) {
			return box.intersectsPlane(this);
		};

		_proto.intersectsSphere = function intersectsSphere(sphere) {
			return sphere.intersectsPlane(this);
		};

		_proto.coplanarPoint = function coplanarPoint(target) {
			if (target === undefined) {
				console.warn('THREE.Plane: .coplanarPoint() target is now required');
				target = new Vector3();
			}

			return target.copy(this.normal).multiplyScalar(-this.constant);
		};

		_proto.applyMatrix4 = function applyMatrix4(matrix, optionalNormalMatrix) {
			var normalMatrix = optionalNormalMatrix || _normalMatrix.getNormalMatrix(matrix);

			var referencePoint = this.coplanarPoint(_vector1).applyMatrix4(matrix);
			var normal = this.normal.applyMatrix3(normalMatrix).normalize();
			this.constant = -referencePoint.dot(normal);
			return this;
		};

		_proto.translate = function translate(offset) {
			this.constant -= offset.dot(this.normal);
			return this;
		};

		_proto.equals = function equals(plane) {
			return plane.normal.equals(this.normal) && plane.constant === this.constant;
		};

		return Plane;
	}();

	var _v0$1 = /*@__PURE__*/new Vector3();

	var _v1$3 = /*@__PURE__*/new Vector3();

	var _v2$1 = /*@__PURE__*/new Vector3();

	var _v3 = /*@__PURE__*/new Vector3();

	var _vab = /*@__PURE__*/new Vector3();

	var _vac = /*@__PURE__*/new Vector3();

	var _vbc = /*@__PURE__*/new Vector3();

	var _vap = /*@__PURE__*/new Vector3();

	var _vbp = /*@__PURE__*/new Vector3();

	var _vcp = /*@__PURE__*/new Vector3();

	var Triangle = /*#__PURE__*/function () {
		function Triangle(a, b, c) {
			this.a = a !== undefined ? a : new Vector3();
			this.b = b !== undefined ? b : new Vector3();
			this.c = c !== undefined ? c : new Vector3();
		}

		Triangle.getNormal = function getNormal(a, b, c, target) {
			if (target === undefined) {
				console.warn('THREE.Triangle: .getNormal() target is now required');
				target = new Vector3();
			}

			target.subVectors(c, b);

			_v0$1.subVectors(a, b);

			target.cross(_v0$1);
			var targetLengthSq = target.lengthSq();

			if (targetLengthSq > 0) {
				return target.multiplyScalar(1 / Math.sqrt(targetLengthSq));
			}

			return target.set(0, 0, 0);
		} // static/instance method to calculate barycentric coordinates
		// based on: http://www.blackpawn.com/texts/pointinpoly/default.html
		;

		Triangle.getBarycoord = function getBarycoord(point, a, b, c, target) {
			_v0$1.subVectors(c, a);

			_v1$3.subVectors(b, a);

			_v2$1.subVectors(point, a);

			var dot00 = _v0$1.dot(_v0$1);

			var dot01 = _v0$1.dot(_v1$3);

			var dot02 = _v0$1.dot(_v2$1);

			var dot11 = _v1$3.dot(_v1$3);

			var dot12 = _v1$3.dot(_v2$1);

			var denom = dot00 * dot11 - dot01 * dot01;

			if (target === undefined) {
				console.warn('THREE.Triangle: .getBarycoord() target is now required');
				target = new Vector3();
			} // collinear or singular triangle


			if (denom === 0) {
				// arbitrary location outside of triangle?
				// not sure if this is the best idea, maybe should be returning undefined
				return target.set(-2, -1, -1);
			}

			var invDenom = 1 / denom;
			var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
			var v = (dot00 * dot12 - dot01 * dot02) * invDenom; // barycentric coordinates must always sum to 1

			return target.set(1 - u - v, v, u);
		};

		Triangle.containsPoint = function containsPoint(point, a, b, c) {
			this.getBarycoord(point, a, b, c, _v3);
			return _v3.x >= 0 && _v3.y >= 0 && _v3.x + _v3.y <= 1;
		};

		Triangle.getUV = function getUV(point, p1, p2, p3, uv1, uv2, uv3, target) {
			this.getBarycoord(point, p1, p2, p3, _v3);
			target.set(0, 0);
			target.addScaledVector(uv1, _v3.x);
			target.addScaledVector(uv2, _v3.y);
			target.addScaledVector(uv3, _v3.z);
			return target;
		};

		Triangle.isFrontFacing = function isFrontFacing(a, b, c, direction) {
			_v0$1.subVectors(c, b);

			_v1$3.subVectors(a, b); // strictly front facing


			return _v0$1.cross(_v1$3).dot(direction) < 0 ? true : false;
		};

		var _proto = Triangle.prototype;

		_proto.set = function set(a, b, c) {
			this.a.copy(a);
			this.b.copy(b);
			this.c.copy(c);
			return this;
		};

		_proto.setFromPointsAndIndices = function setFromPointsAndIndices(points, i0, i1, i2) {
			this.a.copy(points[i0]);
			this.b.copy(points[i1]);
			this.c.copy(points[i2]);
			return this;
		};

		_proto.clone = function clone() {
			return new this.constructor().copy(this);
		};

		_proto.copy = function copy(triangle) {
			this.a.copy(triangle.a);
			this.b.copy(triangle.b);
			this.c.copy(triangle.c);
			return this;
		};

		_proto.getArea = function getArea() {
			_v0$1.subVectors(this.c, this.b);

			_v1$3.subVectors(this.a, this.b);

			return _v0$1.cross(_v1$3).length() * 0.5;
		};

		_proto.getMidpoint = function getMidpoint(target) {
			if (target === undefined) {
				console.warn('THREE.Triangle: .getMidpoint() target is now required');
				target = new Vector3();
			}

			return target.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
		};

		_proto.getNormal = function getNormal(target) {
			return Triangle.getNormal(this.a, this.b, this.c, target);
		};

		_proto.getPlane = function getPlane(target) {
			if (target === undefined) {
				console.warn('THREE.Triangle: .getPlane() target is now required');
				target = new Plane();
			}

			return target.setFromCoplanarPoints(this.a, this.b, this.c);
		};

		_proto.getBarycoord = function getBarycoord(point, target) {
			return Triangle.getBarycoord(point, this.a, this.b, this.c, target);
		};

		_proto.getUV = function getUV(point, uv1, uv2, uv3, target) {
			return Triangle.getUV(point, this.a, this.b, this.c, uv1, uv2, uv3, target);
		};

		_proto.containsPoint = function containsPoint(point) {
			return Triangle.containsPoint(point, this.a, this.b, this.c);
		};

		_proto.isFrontFacing = function isFrontFacing(direction) {
			return Triangle.isFrontFacing(this.a, this.b, this.c, direction);
		};

		_proto.intersectsBox = function intersectsBox(box) {
			return box.intersectsTriangle(this);
		};

		_proto.closestPointToPoint = function closestPointToPoint(p, target) {
			if (target === undefined) {
				console.warn('THREE.Triangle: .closestPointToPoint() target is now required');
				target = new Vector3();
			}

			var a = this.a,
					b = this.b,
					c = this.c;
			var v, w; // algorithm thanks to Real-Time Collision Detection by Christer Ericson,
			// published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.,
			// under the accompanying license; see chapter 5.1.5 for detailed explanation.
			// basically, we're distinguishing which of the voronoi regions of the triangle
			// the point lies in with the minimum amount of redundant computation.

			_vab.subVectors(b, a);

			_vac.subVectors(c, a);

			_vap.subVectors(p, a);

			var d1 = _vab.dot(_vap);

			var d2 = _vac.dot(_vap);

			if (d1 <= 0 && d2 <= 0) {
				// vertex region of A; barycentric coords (1, 0, 0)
				return target.copy(a);
			}

			_vbp.subVectors(p, b);

			var d3 = _vab.dot(_vbp);

			var d4 = _vac.dot(_vbp);

			if (d3 >= 0 && d4 <= d3) {
				// vertex region of B; barycentric coords (0, 1, 0)
				return target.copy(b);
			}

			var vc = d1 * d4 - d3 * d2;

			if (vc <= 0 && d1 >= 0 && d3 <= 0) {
				v = d1 / (d1 - d3); // edge region of AB; barycentric coords (1-v, v, 0)

				return target.copy(a).addScaledVector(_vab, v);
			}

			_vcp.subVectors(p, c);

			var d5 = _vab.dot(_vcp);

			var d6 = _vac.dot(_vcp);

			if (d6 >= 0 && d5 <= d6) {
				// vertex region of C; barycentric coords (0, 0, 1)
				return target.copy(c);
			}

			var vb = d5 * d2 - d1 * d6;

			if (vb <= 0 && d2 >= 0 && d6 <= 0) {
				w = d2 / (d2 - d6); // edge region of AC; barycentric coords (1-w, 0, w)

				return target.copy(a).addScaledVector(_vac, w);
			}

			var va = d3 * d6 - d5 * d4;

			if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
				_vbc.subVectors(c, b);

				w = (d4 - d3) / (d4 - d3 + (d5 - d6)); // edge region of BC; barycentric coords (0, 1-w, w)

				return target.copy(b).addScaledVector(_vbc, w); // edge region of BC
			} // face region


			var denom = 1 / (va + vb + vc); // u = va * denom

			v = vb * denom;
			w = vc * denom;
			return target.copy(a).addScaledVector(_vab, v).addScaledVector(_vac, w);
		};

		_proto.equals = function equals(triangle) {
			return triangle.a.equals(this.a) && triangle.b.equals(this.b) && triangle.c.equals(this.c);
		};

		return Triangle;
	}();

	var _colorKeywords = {
		'aliceblue': 0xF0F8FF,
		'antiquewhite': 0xFAEBD7,
		'aqua': 0x00FFFF,
		'aquamarine': 0x7FFFD4,
		'azure': 0xF0FFFF,
		'beige': 0xF5F5DC,
		'bisque': 0xFFE4C4,
		'black': 0x000000,
		'blanchedalmond': 0xFFEBCD,
		'blue': 0x0000FF,
		'blueviolet': 0x8A2BE2,
		'brown': 0xA52A2A,
		'burlywood': 0xDEB887,
		'cadetblue': 0x5F9EA0,
		'chartreuse': 0x7FFF00,
		'chocolate': 0xD2691E,
		'coral': 0xFF7F50,
		'cornflowerblue': 0x6495ED,
		'cornsilk': 0xFFF8DC,
		'crimson': 0xDC143C,
		'cyan': 0x00FFFF,
		'darkblue': 0x00008B,
		'darkcyan': 0x008B8B,
		'darkgoldenrod': 0xB8860B,
		'darkgray': 0xA9A9A9,
		'darkgreen': 0x006400,
		'darkgrey': 0xA9A9A9,
		'darkkhaki': 0xBDB76B,
		'darkmagenta': 0x8B008B,
		'darkolivegreen': 0x556B2F,
		'darkorange': 0xFF8C00,
		'darkorchid': 0x9932CC,
		'darkred': 0x8B0000,
		'darksalmon': 0xE9967A,
		'darkseagreen': 0x8FBC8F,
		'darkslateblue': 0x483D8B,
		'darkslategray': 0x2F4F4F,
		'darkslategrey': 0x2F4F4F,
		'darkturquoise': 0x00CED1,
		'darkviolet': 0x9400D3,
		'deeppink': 0xFF1493,
		'deepskyblue': 0x00BFFF,
		'dimgray': 0x696969,
		'dimgrey': 0x696969,
		'dodgerblue': 0x1E90FF,
		'firebrick': 0xB22222,
		'floralwhite': 0xFFFAF0,
		'forestgreen': 0x228B22,
		'fuchsia': 0xFF00FF,
		'gainsboro': 0xDCDCDC,
		'ghostwhite': 0xF8F8FF,
		'gold': 0xFFD700,
		'goldenrod': 0xDAA520,
		'gray': 0x808080,
		'green': 0x008000,
		'greenyellow': 0xADFF2F,
		'grey': 0x808080,
		'honeydew': 0xF0FFF0,
		'hotpink': 0xFF69B4,
		'indianred': 0xCD5C5C,
		'indigo': 0x4B0082,
		'ivory': 0xFFFFF0,
		'khaki': 0xF0E68C,
		'lavender': 0xE6E6FA,
		'lavenderblush': 0xFFF0F5,
		'lawngreen': 0x7CFC00,
		'lemonchiffon': 0xFFFACD,
		'lightblue': 0xADD8E6,
		'lightcoral': 0xF08080,
		'lightcyan': 0xE0FFFF,
		'lightgoldenrodyellow': 0xFAFAD2,
		'lightgray': 0xD3D3D3,
		'lightgreen': 0x90EE90,
		'lightgrey': 0xD3D3D3,
		'lightpink': 0xFFB6C1,
		'lightsalmon': 0xFFA07A,
		'lightseagreen': 0x20B2AA,
		'lightskyblue': 0x87CEFA,
		'lightslategray': 0x778899,
		'lightslategrey': 0x778899,
		'lightsteelblue': 0xB0C4DE,
		'lightyellow': 0xFFFFE0,
		'lime': 0x00FF00,
		'limegreen': 0x32CD32,
		'linen': 0xFAF0E6,
		'magenta': 0xFF00FF,
		'maroon': 0x800000,
		'mediumaquamarine': 0x66CDAA,
		'mediumblue': 0x0000CD,
		'mediumorchid': 0xBA55D3,
		'mediumpurple': 0x9370DB,
		'mediumseagreen': 0x3CB371,
		'mediumslateblue': 0x7B68EE,
		'mediumspringgreen': 0x00FA9A,
		'mediumturquoise': 0x48D1CC,
		'mediumvioletred': 0xC71585,
		'midnightblue': 0x191970,
		'mintcream': 0xF5FFFA,
		'mistyrose': 0xFFE4E1,
		'moccasin': 0xFFE4B5,
		'navajowhite': 0xFFDEAD,
		'navy': 0x000080,
		'oldlace': 0xFDF5E6,
		'olive': 0x808000,
		'olivedrab': 0x6B8E23,
		'orange': 0xFFA500,
		'orangered': 0xFF4500,
		'orchid': 0xDA70D6,
		'palegoldenrod': 0xEEE8AA,
		'palegreen': 0x98FB98,
		'paleturquoise': 0xAFEEEE,
		'palevioletred': 0xDB7093,
		'papayawhip': 0xFFEFD5,
		'peachpuff': 0xFFDAB9,
		'peru': 0xCD853F,
		'pink': 0xFFC0CB,
		'plum': 0xDDA0DD,
		'powderblue': 0xB0E0E6,
		'purple': 0x800080,
		'rebeccapurple': 0x663399,
		'red': 0xFF0000,
		'rosybrown': 0xBC8F8F,
		'royalblue': 0x4169E1,
		'saddlebrown': 0x8B4513,
		'salmon': 0xFA8072,
		'sandybrown': 0xF4A460,
		'seagreen': 0x2E8B57,
		'seashell': 0xFFF5EE,
		'sienna': 0xA0522D,
		'silver': 0xC0C0C0,
		'skyblue': 0x87CEEB,
		'slateblue': 0x6A5ACD,
		'slategray': 0x708090,
		'slategrey': 0x708090,
		'snow': 0xFFFAFA,
		'springgreen': 0x00FF7F,
		'steelblue': 0x4682B4,
		'tan': 0xD2B48C,
		'teal': 0x008080,
		'thistle': 0xD8BFD8,
		'tomato': 0xFF6347,
		'turquoise': 0x40E0D0,
		'violet': 0xEE82EE,
		'wheat': 0xF5DEB3,
		'white': 0xFFFFFF,
		'whitesmoke': 0xF5F5F5,
		'yellow': 0xFFFF00,
		'yellowgreen': 0x9ACD32
	};
	var _hslA = {
		h: 0,
		s: 0,
		l: 0
	};
	var _hslB = {
		h: 0,
		s: 0,
		l: 0
	};

	function hue2rgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
		return p;
	}

	function SRGBToLinear(c) {
		return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
	}

	function LinearToSRGB(c) {
		return c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
	}

	var Color = /*#__PURE__*/function () {
		function Color(r, g, b) {
			Object.defineProperty(this, 'isColor', {
				value: true
			});

			if (g === undefined && b === undefined) {
				// r is THREE.Color, hex or string
				return this.set(r);
			}

			return this.setRGB(r, g, b);
		}

		var _proto = Color.prototype;

		_proto.set = function set(value) {
			if (value && value.isColor) {
				this.copy(value);
			} else if (typeof value === 'number') {
				this.setHex(value);
			} else if (typeof value === 'string') {
				this.setStyle(value);
			}

			return this;
		};

		_proto.setScalar = function setScalar(scalar) {
			this.r = scalar;
			this.g = scalar;
			this.b = scalar;
			return this;
		};

		_proto.setHex = function setHex(hex) {
			hex = Math.floor(hex);
			this.r = (hex >> 16 & 255) / 255;
			this.g = (hex >> 8 & 255) / 255;
			this.b = (hex & 255) / 255;
			return this;
		};

		_proto.setRGB = function setRGB(r, g, b) {
			this.r = r;
			this.g = g;
			this.b = b;
			return this;
		};

		_proto.setHSL = function setHSL(h, s, l) {
			// h,s,l ranges are in 0.0 - 1.0
			h = MathUtils.euclideanModulo(h, 1);
			s = MathUtils.clamp(s, 0, 1);
			l = MathUtils.clamp(l, 0, 1);

			if (s === 0) {
				this.r = this.g = this.b = l;
			} else {
				var p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
				var q = 2 * l - p;
				this.r = hue2rgb(q, p, h + 1 / 3);
				this.g = hue2rgb(q, p, h);
				this.b = hue2rgb(q, p, h - 1 / 3);
			}

			return this;
		};

		_proto.setStyle = function setStyle(style) {
			function handleAlpha(string) {
				if (string === undefined) return;

				if (parseFloat(string) < 1) {
					console.warn('THREE.Color: Alpha component of ' + style + ' will be ignored.');
				}
			}

			var m;

			if (m = /^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec(style)) {
				// rgb / hsl
				var color;
				var name = m[1];
				var components = m[2];

				switch (name) {
					case 'rgb':
					case 'rgba':
						if (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
							// rgb(255,0,0) rgba(255,0,0,0.5)
							this.r = Math.min(255, parseInt(color[1], 10)) / 255;
							this.g = Math.min(255, parseInt(color[2], 10)) / 255;
							this.b = Math.min(255, parseInt(color[3], 10)) / 255;
							handleAlpha(color[4]);
							return this;
						}

						if (color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
							// rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)
							this.r = Math.min(100, parseInt(color[1], 10)) / 100;
							this.g = Math.min(100, parseInt(color[2], 10)) / 100;
							this.b = Math.min(100, parseInt(color[3], 10)) / 100;
							handleAlpha(color[4]);
							return this;
						}

						break;

					case 'hsl':
					case 'hsla':
						if (color = /^\s*(\d*\.?\d+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
							// hsl(120,50%,50%) hsla(120,50%,50%,0.5)
							var h = parseFloat(color[1]) / 360;
							var s = parseInt(color[2], 10) / 100;
							var l = parseInt(color[3], 10) / 100;
							handleAlpha(color[4]);
							return this.setHSL(h, s, l);
						}

						break;
				}
			} else if (m = /^\#([A-Fa-f\d]+)$/.exec(style)) {
				// hex color
				var hex = m[1];
				var size = hex.length;

				if (size === 3) {
					// #ff0
					this.r = parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255;
					this.g = parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255;
					this.b = parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255;
					return this;
				} else if (size === 6) {
					// #ff0000
					this.r = parseInt(hex.charAt(0) + hex.charAt(1), 16) / 255;
					this.g = parseInt(hex.charAt(2) + hex.charAt(3), 16) / 255;
					this.b = parseInt(hex.charAt(4) + hex.charAt(5), 16) / 255;
					return this;
				}
			}

			if (style && style.length > 0) {
				return this.setColorName(style);
			}

			return this;
		};

		_proto.setColorName = function setColorName(style) {
			// color keywords
			var hex = _colorKeywords[style];

			if (hex !== undefined) {
				// red
				this.setHex(hex);
			} else {
				// unknown color
				console.warn('THREE.Color: Unknown color ' + style);
			}

			return this;
		};

		_proto.clone = function clone() {
			return new this.constructor(this.r, this.g, this.b);
		};

		_proto.copy = function copy(color) {
			this.r = color.r;
			this.g = color.g;
			this.b = color.b;
			return this;
		};

		_proto.copyGammaToLinear = function copyGammaToLinear(color, gammaFactor) {
			if (gammaFactor === void 0) {
				gammaFactor = 2.0;
			}

			this.r = Math.pow(color.r, gammaFactor);
			this.g = Math.pow(color.g, gammaFactor);
			this.b = Math.pow(color.b, gammaFactor);
			return this;
		};

		_proto.copyLinearToGamma = function copyLinearToGamma(color, gammaFactor) {
			if (gammaFactor === void 0) {
				gammaFactor = 2.0;
			}

			var safeInverse = gammaFactor > 0 ? 1.0 / gammaFactor : 1.0;
			this.r = Math.pow(color.r, safeInverse);
			this.g = Math.pow(color.g, safeInverse);
			this.b = Math.pow(color.b, safeInverse);
			return this;
		};

		_proto.convertGammaToLinear = function convertGammaToLinear(gammaFactor) {
			this.copyGammaToLinear(this, gammaFactor);
			return this;
		};

		_proto.convertLinearToGamma = function convertLinearToGamma(gammaFactor) {
			this.copyLinearToGamma(this, gammaFactor);
			return this;
		};

		_proto.copySRGBToLinear = function copySRGBToLinear(color) {
			this.r = SRGBToLinear(color.r);
			this.g = SRGBToLinear(color.g);
			this.b = SRGBToLinear(color.b);
			return this;
		};

		_proto.copyLinearToSRGB = function copyLinearToSRGB(color) {
			this.r = LinearToSRGB(color.r);
			this.g = LinearToSRGB(color.g);
			this.b = LinearToSRGB(color.b);
			return this;
		};

		_proto.convertSRGBToLinear = function convertSRGBToLinear() {
			this.copySRGBToLinear(this);
			return this;
		};

		_proto.convertLinearToSRGB = function convertLinearToSRGB() {
			this.copyLinearToSRGB(this);
			return this;
		};

		_proto.getHex = function getHex() {
			return this.r * 255 << 16 ^ this.g * 255 << 8 ^ this.b * 255 << 0;
		};

		_proto.getHexString = function getHexString() {
			return ('
