class UtilsNumber {
  /**
   * Returns true if n is a safe integer, between Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER.
   * @param n any
   * @returns boolean
   */
  static isInteger(n: any): boolean {
    return Number.isSafeInteger(n);
  }
  /**
   * Returns true if n is positive.
   * @param n number
   * @returns boolean
   */
  static isPositive(n: number): boolean {
    return n >= 0;
  }
  /**
   * Returns true if n is an integer. Else raise NonIntegerError.
   * @param n number
   * @returns boolean
   * @throws NonIntegerError
   */
  static checkIntegerNumber(n: number): number {
    if (this.isInteger(n)) return n;
    throw new Error("NonSafeIntegerError");
  }
  /**
   * Returns true if n is positive. Else raise NonPositiveError.
   * @param n number
   * @returns boolean
   * @throws NonPositiveError
   */
  static checkPositiveNumber(n: number): number {
    if (this.isPositive(n)) return n;
    throw new Error("NonPositiveError");
  }
  /**
   * Returns true if n is a positive integer
   * @param n any
   * @returns boolean
   * @throws
   */
  static checkIntegerPositive(n: number): number {
    try {
      return this.checkPositiveNumber(this.checkIntegerNumber(n));
    } catch (error) {
      throw error;
    }
  }
}

class UtilsCallback {
  /**
   * Call a callback function with or without its arguments synchronously and return its result or throw error.
   *
   * @param callback
   * @param args Optionnal
   */
  static callSyncCallback<T>(callback: (args?: any[]) => T, args?: any[]): T {
    try {
      if (args) {
        return callback(...args);
      }

      return callback();
    } catch (error) {
      throw error;
    }
  }
  /**
   * Call a callback function with or without its arguments asynchronously and return its result or throw error.
   * 
   * @param callback
   * @param args Optionnal
   */
  static async callAsyncCallback<T>(
    callback: (args?: any[]) => Promise<T>,
    args?: any[]
  ): Promise<T> {
    try {
      if (args) {
        return await callback(...args);
      }

      return await callback();
    } catch (error) {
      throw error;
    }
  }
}

export { UtilsNumber, UtilsCallback };
