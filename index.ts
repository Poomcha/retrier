import { Retrier } from "./src/retrier/Retrier";

/**
 * Retries a synchronous operation, with a specified number of retries.
 * Returns the result of the operation as soon as it succeed, or throws
 * operation's error.
 * Give access to onSuccess and onFailure optionnal handlers to handle
 * success or failure.
 * onSuccess and onFailure are given operation result as first argument.
 *
 * @see [source](https://github.com/Poomcha/retrier)
 *
 *
 * @param maxRetries - Positive integer, max number of retries <code>(Number[0, MAX_SAFE_INTEGER])</code>.
 * @param callback - Function to retry.
 * @param args - Optionnal arguments for callback.
 *
 *
 * @param options - Optionnal options.
 *
 *
 * @param options.onSuccess -
 * @param options.onSuccess.callback - Function to run on success.
 * @param options.onSuccess.args - Optionnal arguments for onSuccess.callback,
 *                                 first argument will always be global callback result as <code>[res, ...args]</code>.
 * @param options.onSuccess.override - Optionnal boolean, if true retrySync will return options.onSuccess.callback result.
 *
 * @param options.Failure -
 * @param options.onFailure.callback - Function to run on failure.
 * @param options.onFailure.args - Optionnal arguments for onFailure.callback,
 *                                 first argument will always be global callback result as <code>[res, ...args]</code>.
 * @param options.onFailure.override - Boolean, if true retrySync will return options.onFailure.callback result.
 *
 *
 * @returns callback result or options.onSuccess.callback result or options.onFailure.callback result.
 *
 *
 * @throw callback error or options.onSuccess.callback error or options.onFailure.callback error.
 */
const retrySync = Retrier.retryStaticSync;

/**
 * Retries an asynchronous operation, with a specified number of retries.
 * Returns the result of the operation as soon as it succeed, or throws
 * operation's error.
 * Give access to onSuccess and onFailure optionnal handlers to handle
 * success or failure.
 * onSuccess and onFailure are given operation result as first argument.
 *
 * @see [source](https://github.com/Poomcha/retrier)
 *
 * @param maxRetries - Positive integer, max number of retries <code>(Number[0, MAX_SAFE_INTEGER])</code>.
 * @param callback - Function to retry.
 * @param args - Optionnal arguments for callback.
 *
 *
 * @param options - Optionnal options.
 *
 * @param options.delay - Positive integer, delay between 2 retry.
 * 
 * @param options.onSuccess -
 * @param options.onSuccess.callback - Function to run on success.
 * @param options.onSuccess.args - Optionnal arguments for onSuccess.callback,
 *                                 first argument will always be global callback result as <code>[res, ...args]</code>.
 * @param options.onSuccess.override - Optionnal boolean, if true retrySync will return options.onSuccess.callback result.
 *
 * @param options.Failure -
 * @param options.onFailure.callback - Function to run on failure.
 * @param options.onFailure.args - Optionnal arguments for onFailure.callback,
 *                                 first argument will always be global callback result as <code>[res, ...args]</code>.
 * @param options.onFailure.override - Boolean, if true retrySync will return options.onFailure.callback result.
 *
 *
 * @returns callback result or options.onSuccess.callback result or options.onFailure.callback result.
 *
 *
 * @throw callback error or options.onSuccess.callback error or options.onFailure.callback error.
 */
const retryAsync = Retrier.retryStaticAsync;

export { Retrier, retrySync, retryAsync };
