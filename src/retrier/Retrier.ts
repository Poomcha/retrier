/*
 * TODO
 * - Complete documentation
 * - Refactor tests
 */

import {
  EffectCallback,
  RetrierOptions,
  RetryOptionsAsync,
  RetryOptionsSync,
  SetRetrierOptions,
} from "./types";

import { UtilsNumber, UtilsCallback } from "../helpers/Utils";

/**
 * The Retrier class provides methods to retry operations synchronously and asynchronously
 * with a specified number of retries.
 *
 * @see [source](https://github.com/Poomcha/retrier)
 *
 */
class Retrier {
  //#region Members
  private _maxRetries: number;
  private readonly _maxRetriesDefault: number = 2;

  private _delay: number;
  private readonly _delayDefault: number = 0;

  private _onSuccess: EffectCallback<any> | undefined = undefined;
  private _onFailure: EffectCallback<any> | undefined = undefined;
  //#endregion

  //#region Constructor
  /**
   * Constructs a new Retrier instance with optional configuration options.
   * @constructor
   *
   * @param options - Optional configuration options.
   * @param options.maxRetries - The maximum number of retries.
   * @param options.delay - Delay between two retries in ms.
   * @param options.onSuccess - onSuccess callback, can override default return.
   * @param options.onFailure - onFailure callback, can override default error throwing.
   * @throws Will throw an error if the maxRetries or delay are not valid positive integer
   * [0, Number.MAX_SAFE_INTEGER].
   */

  constructor(options?: RetrierOptions<any, any>) {
    if (options) {
      const { maxRetries, delay, onSuccess, onFailure } = options;
      try {
        if (maxRetries) this.setMaxRetries(maxRetries);
        else this.setMaxRetries(this._maxRetriesDefault);

        if (delay) this.setDelay(delay);
        else this.setDelay(this._delayDefault);

        if (onSuccess) this.setOnSuccess(onSuccess);
        if (onFailure) this.setOnFailure(onFailure);
      } catch (error) {
        throw error;
      }
    } else {
      try {
        this.setMaxRetries(this._maxRetriesDefault);
        this.setDelay(this._delayDefault);
      } catch (error) {
        throw error;
      }
    }
  }
  //#endregion

  //#region Getters
  /**
   * Gets the maximum number of retries.
   *
   * @returns The maximum number of retries.
   */
  public getMaxRetries(): number {
    return this._maxRetries;
  }
  /**
   * Gets the delay between retries.
   *
   * @returns Delay between retries.
   */
  public getDelay(): number {
    return this._delay;
  }
  /**
   * Get the _onSuccess private member.
   *
   * @returns _onSuccess member
   */
  public getOnSuccess(): EffectCallback<any> | undefined {
    return this._onSuccess;
  }
  /**
   * Get the _onFailure private member.
   *
   * @returns _onFailure member.
   */
  public getOnFailure(): EffectCallback<any> | undefined {
    return this._onFailure;
  }
  //#endregion

  //#region Setters
  /**
   * Sets the maximum number of retries.
   *
   * @param n - The number of retries to set.
   * @throws Will throw an error if the number is not a valid positive integer.
   */
  public setMaxRetries(n: number): void {
    try {
      this._maxRetries = UtilsNumber.checkIntegerNumber(n);
    } catch (error) {
      throw error;
    }
  }
  /**
   * Sets the delay between retries.
   *
   * @param delay - Delay between retries.
   * @throws Will throw an error if the number is not a valid positive integer
   */
  public setDelay(delay: number): void {
    try {
      this._delay = UtilsNumber.checkIntegerNumber(delay);
    } catch (error) {
      throw error;
    }
  }
  /**
   * Sets the _onSuccess member
   *
   * @param onSuccess
   * @param onSuccess.callback Callback to call on success
   * @param onSuccess.args Arguments to pass to the callback
   * @param onSuccess.override If true, override default behaviour of retry functions
   */
  public setOnSuccess<T>(onSuccess: EffectCallback<T>): void {
    this._onSuccess = onSuccess;
    return;
  }
  /**
   * Sets the _onFailure member
   *
   * @param onFailure
   * @param onFailure.callback Callback to call on failure
   * @param onFailure.args Arguments to pass to the callback
   * @param onFailure.override If true, override default behaviour of retry functions
   */
  public setOnFailure<T>(onFailure: EffectCallback<T>): void {
    this._onFailure = onFailure;
    return;
  }
  //#endregion

  //#region Static Methods
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
  static retryStaticSync<T, OnSuccess, OnFailure>(
    maxRetries: number,
    callback: (...args: any[]) => T,
    args?: any[],
    options?: RetryOptionsSync<OnSuccess, OnFailure>
  ): T | OnSuccess | OnFailure {
    try {
      return Retrier._retrySync(callback, maxRetries, args, options);
    } catch (error) {
      throw error;
    }
  }

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
  static async retryStaticAsync<T, OnSuccess, OnFailure>(
    maxRetries: number,
    callback: (...args: any[]) => Promise<T>,
    args?: any[],
    options?: RetryOptionsAsync<OnSuccess, OnFailure>
  ): Promise<T | OnSuccess | OnFailure> {
    try {
      return await Retrier._retryAsync(callback, maxRetries, args, options);
    } catch (error) {
      throw error;
    }
  }
  //#endregion

  //#region Public Methods
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
   * @param callback - Function to retry.
   * @param args - Optionnal arguments for callback.
   *
   *
   * @param options - Optionnal options, overule instance configuration.
   *
   * @param options.maxRetries - Positive integer, max number of retries <code>(Number[0, MAX_SAFE_INTEGER])</code>.
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
  public retrySync<T, OnSuccess, OnFailure>(
    callback: (...args: any[]) => T,
    args?: any[],
    options?: RetrierOptions<OnSuccess, OnFailure>
  ): T | OnSuccess | OnFailure {
    try {
      const computedOptions = this.makeOptionsSync<OnSuccess, OnFailure>(
        options
      );

      return Retrier._retrySync<T, OnSuccess, OnFailure>(
        callback,
        computedOptions.maxRetries,
        args,
        computedOptions
      );
    } catch (error) {
      throw error;
    }
  }

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
   * @param callback - Function to retry.
   * @param args - Optionnal arguments for callback.
   *
   *
   * @param options - Optionnal options.
   *
   * @param options.maxRetries - Positive integer, max number of retries <code>(Number[0, MAX_SAFE_INTEGER])</code>.
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
  public async retryAsync<T, OnSuccess, OnFailure>(
    callback: (...args: any[]) => Promise<T>,
    args?: any[],
    options?: RetrierOptions<OnSuccess, OnFailure>
  ): Promise<T | OnSuccess | OnFailure> {
    try {
      const computedOptions = this.makeOptionsAsync<OnSuccess, OnFailure>(
        options
      );

      return await Retrier._retryAsync<T, OnSuccess, OnFailure>(
        callback,
        computedOptions.maxRetries,
        args,
        computedOptions
      );
    } catch (error) {
      throw error;
    }
  }
  //#endregion

  //#region Private Methods
  /**
   * Internal method to retry a synchronous operation.
   *
   * @param callback - The callback function to retry.
   * @param retry - The current retry count.
   * @param args - Optional arguments to pass to the callback.
   * @param options - Optional retry options.
   * @returns The result of the callback function.
   * @throws Will throw an error if all retries fail.
   */
  private static _retrySync<T, OnSuccess, OnFailure>(
    callback: (...args: any[]) => T,
    retry: number,
    args?: any[],
    options?: RetryOptionsSync<OnSuccess, OnFailure>
  ): T | OnSuccess | OnFailure {
    let onSuccess: EffectCallback<OnSuccess> | undefined;
    let onFailure: EffectCallback<OnFailure> | undefined;
    if (options) {
      onSuccess = options.onSuccess;
      onFailure = options.onFailure;
    }
    try {
      const res = UtilsCallback.callSyncCallback<T>(callback, args);
      if (onSuccess) {
        const onSuccessRes = UtilsCallback.callSyncCallback<OnSuccess>(
          onSuccess.callback as (args?: any[]) => OnSuccess,
          [res, ...(onSuccess.args || [])]
        );
        if (onSuccess.override) {
          return onSuccessRes;
        }
      }

      return res;
    } catch (error) {
      if (retry > 0) {
        return Retrier._retrySync(callback, retry - 1, args, options);
      }

      if (onFailure) {
        const onFailureRes = UtilsCallback.callSyncCallback<OnFailure>(
          onFailure.callback as (args?: any[]) => OnFailure,
          [error, ...(onFailure.args || [])]
        );
        if (onFailure.override) {
          return onFailureRes;
        }
      }

      throw error;
    }
  }

  /**
   * Internal method to retry an asynchronous operation.
   *
   * @param callback - The callback function to retry.
   * @param retry - The current retry count.
   * @param args - Optional arguments to pass to the callback.
   * @param options - Optional retry options.
   * @returns A promise that resolves to the result of the callback function.
   * @throws Will throw an error if all retries fail.
   */
  private static async _retryAsync<T, OnSuccess, OnFailure>(
    callback: (...args: any[]) => Promise<T>,
    retry: number,
    args?: any[],
    options?: RetryOptionsAsync<OnSuccess, OnFailure>
  ): Promise<T | OnSuccess | OnFailure> {
    let onSuccess: EffectCallback<OnSuccess> | undefined;
    let onFailure: EffectCallback<OnFailure> | undefined;
    if (options) {
      onSuccess = options.onSuccess;
      onFailure = options.onFailure;
    }
    try {
      const res = await UtilsCallback.callAsyncCallback<T>(callback, args);

      if (onSuccess) {
        const onSuccessRes = await UtilsCallback.callAsyncCallback<OnSuccess>(
          onSuccess.callback as (args?: any[]) => Promise<OnSuccess>,
          [res, ...(onSuccess.args || [])]
        );
        if (onSuccess.override) {
          return onSuccessRes;
        }
      }

      return res;
    } catch (error) {
      if (retry > 0) {
        if (options && options.delay && options.delay > 0) {
          await new Promise((resolve) => {
            const timeout = setTimeout(resolve, options.delay);
            // clearTimeout(timeout);
          });
        }
        return Retrier._retryAsync(callback, retry - 1, args, options);
      }

      if (onFailure) {
        const onFailureRes = await UtilsCallback.callAsyncCallback<OnFailure>(
          onFailure.callback as (args?: any[]) => Promise<OnFailure>,
          [error, ...(onFailure.args || [])]
        );
        if (onFailure.override) {
          return onFailureRes;
        }
      }

      throw error;
    }
  }

  /**
   * Internal method to set options configuration for non static sync methods
   *
   * @param options
   */
  private makeOptionsSync<OnSuccess, OnFailure>(
    options: RetrierOptions<OnSuccess, OnFailure> | undefined
  ): SetRetrierOptions<OnSuccess, OnFailure> {
    let computedOptions = options;

    if (computedOptions) {
      if (!computedOptions.maxRetries)
        computedOptions.maxRetries = this.getMaxRetries();
      else {
        try {
          UtilsNumber.checkIntegerPositive(computedOptions.maxRetries);
        } catch (error) {
          throw error;
        }
      }
      if (!computedOptions.onSuccess)
        computedOptions.onSuccess = this.getOnSuccess();
      if (!computedOptions.onFailure)
        computedOptions.onFailure = this.getOnFailure();
    } else {
      computedOptions = {
        maxRetries: this.getMaxRetries(),
        onSuccess: this.getOnSuccess(),
        onFailure: this.getOnFailure(),
      };
    }

    return computedOptions as SetRetrierOptions<OnSuccess, OnFailure>;
  }

  /**
   * Internal method to set options configuration for non static async methods
   *
   * @param options
   */
  private makeOptionsAsync<OnSuccess, OnFailure>(
    options: RetrierOptions<OnSuccess, OnFailure> | undefined
  ): SetRetrierOptions<OnSuccess, OnFailure> {
    let computedOptions = options;

    if (computedOptions) {
      try {
        if (!computedOptions.maxRetries)
          computedOptions.maxRetries = this.getMaxRetries();
        else UtilsNumber.checkIntegerPositive(computedOptions.maxRetries);
        if (!computedOptions.delay) computedOptions.delay = this.getDelay();
        else UtilsNumber.checkIntegerPositive(computedOptions.delay);
      } catch (error) {
        throw error;
      }
      if (!computedOptions.onSuccess)
        computedOptions.onSuccess = this.getOnSuccess();
      if (!computedOptions.onFailure)
        computedOptions.onFailure = this.getOnFailure();
    } else {
      computedOptions = {
        maxRetries: this.getMaxRetries(),
        delay: this.getDelay(),
        onSuccess: this.getOnSuccess(),
        onFailure: this.getOnFailure(),
      };
    }

    return computedOptions as SetRetrierOptions<OnSuccess, OnFailure>;
  }
  //#endregion
}

export { Retrier };
