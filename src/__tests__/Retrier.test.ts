import { Retrier } from '../retrier/Retrier';
import type { EffectCallback } from '../retrier/Retrier';

//#region Constants
const MAX_RETRIES_DEFAULT = 2;
const MAX_RETRIES_CUSTOM = 4;
const DELAY_DEFAULT = 0;
const ONSUCCESS_DEFAULT = undefined;
const ONFAILURE_DEFAULT = undefined;
const ONSUCCESS_SYNC_RETURNS_VOID: EffectCallback<void> = {
  callback: jest.fn((_res, _x, _y) => {
    return;
  }),
  args: [10, 20],
};
const ONSUCCESS_ASYNC_RETURNS_VOID: EffectCallback<Promise<void>> = {
  callback: jest.fn(async (_res, _x, _y) => {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }),
  args: [10, 20],
};
const ONSUCCESS_SYNC_RETURNS_30: EffectCallback<number> = {
  callback: jest.fn((_res, x, y) => {
    return x + y;
  }),
  args: [10, 20],
  override: true,
};
const ONSUCCESS_ASYNC_RETURNS_30: EffectCallback<Promise<number>> = {
  callback: jest.fn(async (_res, x, y) => {
    return new Promise((resolve, reject) => {
      resolve(x + y);
    });
  }),
  args: [10, 20],
  override: true,
};
const ONSUCCESS_SYNC_MODIFY_RES: EffectCallback<any> = {
  callback: jest.fn((res, a, b) => {
    return res + '!';
  }),
  args: [10, 20],
  override: true,
};
const ONSUCCESS_ASYNC_MODIFY_RES: EffectCallback<Promise<any>> = {
  callback: jest.fn((res, _a, _b) => {
    return new Promise((resolve, reject) => {
      resolve(res + '!');
    });
  }),
  args: [10, 20],
  override: true,
};
const ONFAILURE_SYNC_RETURNS_VOID: EffectCallback<void> = {
  callback: jest.fn((_error, _a, _b) => {
    return;
  }),
  args: [5, 90],
  override: false,
};
const ONFAILURE_ASYNC_RETURNS_VOID: EffectCallback<Promise<void>> = {
  callback: jest.fn(async (_error, _a, _b) => {
    new Promise((resolve) => {
      resolve(() => {
        return;
      });
    });
  }),
  args: [5, 90],
  override: false,
};
const ONFAILURE_SYNC_THROWS_ERROR: EffectCallback<void> = {
  callback: jest.fn((_error, _a, _b) => {
    throw new Error('OnFailureError');
  }),
  args: [5, 90],
  override: false,
};
const ONFAILURE_ASYNC_THROWS_ERROR: EffectCallback<void> = {
  callback: jest.fn(async (_error, _a, _b) => {
    return new Promise((_, reject) => {
      reject(() => {
        throw new Error('OnFailureErrorAsync');
      });
    });
  }),
};
const ONFAILURE_SYNC_RETURNS_85: EffectCallback<number> = {
  callback: jest.fn((_error, a, b) => {
    return b - a;
  }),
  args: [5, 90],
  override: true,
};
const ONFAILURE_ASYNC_RETURNS_85: EffectCallback<Promise<number>> = {
  callback: jest.fn(async (_error, a, b) => {
    return new Promise((resolve) => {
      resolve(b - a);
    });
  }),
  args: [5, 90],
  override: true,
};
const CALLBACK_SUCCESS_SIMPLE = function (success: string = 'success') {
  return success;
};
const CALLBACK_SUCCESS_SIMPLE_ASYNC = async function (success: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(success);
    }, 1000);
  });
};
//#endregion

describe('Retrier', () => {
  //#region Instanciation
  describe('Retrier Instanciation', () => {
    describe('Should correctly instantiate a retrier', () => {
      test('Without parameter', () => {
        const retrier = new Retrier();

        expect(retrier.getMaxRetries()).toBe(MAX_RETRIES_DEFAULT);
        expect(retrier.getDelay()).toBe(DELAY_DEFAULT);
        expect(retrier.getOnSuccess()).toBe(ONSUCCESS_DEFAULT);
        expect(retrier.getOnFailure()).toBe(ONFAILURE_DEFAULT);
      });

      test('With maxRetries and delay', () => {
        const retrier = new Retrier({ maxRetries: 3, delay: 1000 });

        expect(retrier.getMaxRetries()).toBe(3);
        expect(retrier.getDelay()).toBe(1000);
        expect(retrier.getOnSuccess()).toBe(ONSUCCESS_DEFAULT);
        expect(retrier.getOnFailure()).toBe(ONFAILURE_DEFAULT);
      });

      test('With all parameters', () => {
        const retrier = new Retrier({
          maxRetries: 5,
          delay: 2000,
          onSuccess: ONSUCCESS_SYNC_RETURNS_VOID,
          onFailure: ONFAILURE_SYNC_RETURNS_VOID,
        });

        expect(retrier.getMaxRetries()).toBe(5);
        expect(retrier.getDelay()).toBe(2000);
        expect(JSON.stringify(retrier.getOnSuccess())).toBe(
          JSON.stringify(ONSUCCESS_SYNC_RETURNS_VOID),
        );
        expect(JSON.stringify(retrier.getOnFailure())).toBe(
          JSON.stringify(ONFAILURE_SYNC_RETURNS_VOID),
        );
      });
    });
  });
  //#endregion
  //#region Functions
  describe('Functions', () => {
    //#region Succeed
    describe('Succeed after X attempts', () => {
      test('Succeed immediately', async () => {
        const retrier = new Retrier();
        const callback = jest.fn(CALLBACK_SUCCESS_SIMPLE);
        const callbackAsync = jest.fn(CALLBACK_SUCCESS_SIMPLE_ASYNC);

        expect(retrier.retrySync(callback, ['success'])).toBe('success');
        expect(callback).toHaveBeenCalledTimes(1);

        const asyncResult = await retrier.retryAsync(callbackAsync, [
          'success',
        ]);

        expect(asyncResult).toBe('success');
        expect(callbackAsync).toHaveBeenCalledTimes(1);
      });
      test('Succeed after 3 attempts', async () => {
        const retrier = new Retrier();
        let attempt = 0;
        const callback = jest.fn((success: string) => {
          if (attempt === 2) return success;
          attempt++;
          throw new Error('FailedError');
        });
        let attemptAsync = 0;
        const callbackAsync = jest.fn(async (success) => {
          return new Promise((resolve, reject) => {
            if (attemptAsync === 2) {
              resolve(success);
            } else {
              attemptAsync++;
              reject('fail');
            }
          });
        });

        expect(retrier.retrySync(callback, ['success'])).toBe('success');
        expect(callback).toHaveBeenCalledTimes(3);

        const asyncResult = await retrier.retryAsync(callbackAsync, [
          'successAsync',
        ]);

        expect(asyncResult).toBe('successAsync');
        expect(callbackAsync).toHaveBeenCalledTimes(3);
      });
      describe('Succeed after X attempts with custom options', () => {
        describe('Set on the instance', () => {
          describe('maxRetries', () => {
            test('Succeed after MAX_RETRIES_CUTSOM + 1 attempts', async () => {
              const retrier = new Retrier({ maxRetries: MAX_RETRIES_CUSTOM });

              let attempt = 0;
              const callback = jest.fn((success: string) => {
                if (attempt === MAX_RETRIES_CUSTOM) return success;
                attempt++;
                throw new Error('FailedError');
              });

              let attemptAsync = 0;
              const callbackAsync = jest.fn(async (success) => {
                return new Promise((resolve, reject) => {
                  if (attemptAsync === MAX_RETRIES_CUSTOM) {
                    resolve(success);
                  } else {
                    attemptAsync++;
                    reject('fail');
                  }
                });
              });

              expect(retrier.retrySync(callback, ['success'])).toBe('success');
              expect(callback).toHaveBeenCalledTimes(MAX_RETRIES_CUSTOM + 1);

              const resultAsync = await retrier.retryAsync(callbackAsync, [
                'successAsync',
              ]);

              expect(resultAsync).toBe('successAsync');
              expect(callbackAsync).toHaveBeenCalledTimes(
                MAX_RETRIES_CUSTOM + 1,
              );
            });
          });
          describe('delay', () => {
            test('Succeed after MAX_RETRIES_CUTSOM + 1 attempts', async () => {
              const retrier = new Retrier({
                maxRetries: MAX_RETRIES_CUSTOM,
                delay: 500,
              });

              let attemptAsync = 0;
              const callbackAsync = jest.fn(async (success) => {
                return new Promise((resolve, reject) => {
                  if (attemptAsync === MAX_RETRIES_CUSTOM) {
                    resolve(success);
                  } else {
                    attemptAsync++;
                    reject('fail');
                  }
                });
              });

              const timeBefore = Date.now();
              const resultAsync = await retrier.retryAsync(callbackAsync, [
                'successAsync',
              ]);
              const timeAfter = Date.now();
              const delta = (timeAfter - timeBefore) / 1000;

              expect(resultAsync).toBe('successAsync');
              expect(callbackAsync).toHaveBeenCalledTimes(
                MAX_RETRIES_CUSTOM + 1,
              );
              expect(delta).toBeCloseTo((MAX_RETRIES_CUSTOM * 500) / 1000);
            }, 20000);
          });
          describe('onSuccess', () => {
            describe('without override', () => {
              test('Succeed after MAX_RETRIES_CUTSOM + 1 attempts', async () => {
                const retrier = new Retrier({
                  maxRetries: MAX_RETRIES_CUSTOM,
                  onSuccess: ONSUCCESS_SYNC_RETURNS_VOID,
                });

                let attempt = 0;
                const callback = jest.fn((success: string) => {
                  if (attempt === MAX_RETRIES_CUSTOM) return success;
                  attempt++;
                  throw new Error('FailedError');
                });

                expect(retrier.retrySync(callback, ['success'])).toBe(
                  'success',
                );
                expect(callback).toHaveBeenCalledTimes(5);
                expect(retrier.getOnSuccess()?.callback).toHaveBeenCalledTimes(
                  1,
                );

                retrier.setOnSuccess(ONSUCCESS_ASYNC_RETURNS_VOID);

                let attemptAsync = 0;
                const callbackAsync = jest.fn(async (success) => {
                  return new Promise((resolve, reject) => {
                    if (attemptAsync === MAX_RETRIES_CUSTOM) {
                      resolve(success);
                    } else {
                      attemptAsync++;
                      reject('fail');
                    }
                  });
                });

                const resultAsync = await retrier.retryAsync(callbackAsync, [
                  'successAsync',
                ]);

                expect(resultAsync).toBe('successAsync');
                expect(retrier.getOnSuccess()?.callback).toHaveBeenCalledTimes(
                  1,
                );
              });
            });
            describe('with override', () => {
              test('Succeed after MAX_RETRIES_CUTSOM + 1 attempts and return onSuccess result', async () => {
                const retrier = new Retrier({
                  maxRetries: MAX_RETRIES_CUSTOM,
                  onSuccess: ONSUCCESS_SYNC_RETURNS_30,
                });

                let attempt = 0;
                const callback = jest.fn((success: string) => {
                  if (attempt === MAX_RETRIES_CUSTOM) return success;
                  attempt++;
                  throw new Error('FailedError');
                });

                expect(retrier.retrySync(callback, ['success'])).toBe(30);
                expect(callback).toHaveBeenCalledTimes(5);
                expect(retrier.getOnSuccess()?.callback).toHaveBeenCalledTimes(
                  1,
                );

                retrier.setOnSuccess(ONSUCCESS_ASYNC_RETURNS_30);

                let attemptAsync = 0;
                const callbackAsync = jest.fn(async (success) => {
                  return new Promise((resolve, reject) => {
                    if (attemptAsync === MAX_RETRIES_CUSTOM) {
                      resolve(success);
                    } else {
                      attemptAsync++;
                      reject('fail');
                    }
                  });
                });

                const resultAsync = await retrier.retryAsync(callbackAsync, [
                  'successAsync',
                ]);

                expect(resultAsync).toBe(30);
                expect(retrier.getOnSuccess()?.callback).toHaveBeenCalledTimes(
                  1,
                );
              });
              test('Succeed after MAX_RETRIES_CUTSOM + 1 attempts and return modified initial result', async () => {
                const retrier = new Retrier({
                  maxRetries: MAX_RETRIES_CUSTOM,
                  onSuccess: ONSUCCESS_SYNC_MODIFY_RES,
                });

                let attempt = 0;
                const callback = jest.fn((success: string) => {
                  if (attempt === MAX_RETRIES_CUSTOM) return success;
                  attempt++;
                  throw new Error('FailedError');
                });

                expect(retrier.retrySync(callback, ['success'])).toBe(
                  'success!',
                );
                expect(callback).toHaveBeenCalledTimes(5);
                expect(retrier.getOnSuccess()?.callback).toHaveBeenCalledTimes(
                  1,
                );

                retrier.setOnSuccess(ONSUCCESS_ASYNC_MODIFY_RES);

                let attemptAsync = 0;
                const callbackAsync = jest.fn(async (success) => {
                  return new Promise((resolve, reject) => {
                    if (attemptAsync === MAX_RETRIES_CUSTOM) {
                      resolve(success);
                    } else {
                      attemptAsync++;
                      reject('fail');
                    }
                  });
                });

                const resultAsync = await retrier.retryAsync(callbackAsync, [
                  'successAsync',
                ]);

                expect(resultAsync).toBe('successAsync!');
                expect(retrier.getOnSuccess()?.callback).toHaveBeenCalledTimes(
                  1,
                );
              });
            });
          });
        });
        describe('Set on the function', () => {
          describe('maxRetries', () => {
            test('Succeed after MAX_RETRIES_CUTSOM + 1 attempts', () => {
              const retrier = new Retrier();

              let attempt = 0;
              const callback = jest.fn((success: string) => {
                if (attempt === MAX_RETRIES_CUSTOM) return success;
                attempt++;
                throw new Error('FailedError');
              });

              expect(
                retrier.retrySync(callback, ['success'], {
                  maxRetries: MAX_RETRIES_CUSTOM,
                }),
              ).toBe('success');
              expect(callback).toHaveBeenCalledTimes(5);
            });
          });
          describe('onSuccess', () => {
            describe('without override', () => {
              test('Succeed after MAX_RETRIES_CUTSOM + 1 attempts', () => {
                const retrier = new Retrier({
                  maxRetries: MAX_RETRIES_CUSTOM,
                });

                let attempt = 0;
                const callback = jest.fn((success: string) => {
                  if (attempt === MAX_RETRIES_CUSTOM) return success;
                  attempt++;
                  throw new Error('FailedError');
                });

                expect(
                  retrier.retrySync(callback, ['success'], {
                    onSuccess: ONSUCCESS_SYNC_RETURNS_VOID,
                  }),
                ).toBe('success');
                expect(callback).toHaveBeenCalledTimes(5);
              });
            });
            describe('with override', () => {
              test('Succeed after MAX_RETRIES_CUTSOM + 1 attempts and return onSuccess result', () => {
                const retrier = new Retrier({
                  maxRetries: MAX_RETRIES_CUSTOM,
                });

                let attempt = 0;
                const callback = jest.fn((success: string) => {
                  if (attempt === MAX_RETRIES_CUSTOM) return success;
                  attempt++;
                  throw new Error('FailedError');
                });

                expect(
                  retrier.retrySync(callback, ['success'], {
                    onSuccess: ONSUCCESS_SYNC_RETURNS_30,
                  }),
                ).toBe(30);
                expect(callback).toHaveBeenCalledTimes(5);
              });
              test('Succeed after MAX_RETRIES_CUTSOM + 1 attempts and return modified initial result', () => {
                const retrier = new Retrier({
                  maxRetries: MAX_RETRIES_CUSTOM,
                });

                let attempt = 0;
                const callback = jest.fn((success: string) => {
                  if (attempt === MAX_RETRIES_CUSTOM) return success;
                  attempt++;
                  throw new Error('FailedError');
                });

                expect(
                  retrier.retrySync(callback, ['success'], {
                    onSuccess: ONSUCCESS_SYNC_MODIFY_RES,
                  }),
                ).toBe('success!');
                expect(callback).toHaveBeenCalledTimes(5);
              });
            });
          });
        });
      });
    });
    //#endregion
    //#region Failed
    describe('Failed after X attempts', () => {
      describe('Failed after X attempts', () => {
        test('Failed after 3 attempts', async () => {
          const retrier = new Retrier();
          const callback = jest.fn((success: string) => {
            throw new Error('FailedError');
          });
          const callbackAsync = jest.fn(async (success) => {
            return new Promise((resolve, reject) => {
              reject(() => {
                throw new Error('FailedErrorAsync');
              });
            });
          });

          expect(() => retrier.retrySync(callback, ['success'])).toThrow(
            'FailedError',
          );
          expect(callback).toHaveBeenCalledTimes(3);

          const resultAsync = retrier.retryAsync(callbackAsync, [
            'successAsync',
          ]);

          await expect(resultAsync).rejects.toThrow('FailedErrorAsync');
          expect(callbackAsync).toHaveBeenCalledTimes(3);
        });
      });
      describe('Failed after X attempts with custom options', () => {
        describe('Set on the instance', () => {
          describe('maxRetries', () => {
            test('Should throw error after MAX_RETRIES_CUSTOM + 1 attemps', async () => {
              const retrier = new Retrier({ maxRetries: MAX_RETRIES_CUSTOM });
              const callback = jest.fn((_success: string) => {
                throw new Error('FailedError');
              });

              expect(() => retrier.retrySync(callback, ['success'])).toThrow(
                'FailedError',
              );
              expect(callback).toHaveBeenCalledTimes(MAX_RETRIES_CUSTOM + 1);

              const callbackAsync = jest.fn((_success) => {
                return new Promise((_, reject) => {
                  reject(() => {
                    throw new Error('FailedErrorAsync');
                  });
                });
              });

              const resultAsync = retrier.retryAsync(callbackAsync, [
                'success',
              ]);

              await expect(resultAsync).rejects.toThrow('FailedErrorAsync');
              expect(callbackAsync).toHaveBeenCalledTimes(
                MAX_RETRIES_CUSTOM + 1,
              );
            });
          });
          describe('onFailure', () => {
            describe('without override', () => {
              test('Failed after MAX_RETRIES_CUSTOM + 1 attempts', async () => {
                const retrier = new Retrier({
                  maxRetries: MAX_RETRIES_CUSTOM,
                  onFailure: ONFAILURE_SYNC_RETURNS_VOID,
                });

                const callback = jest.fn((success: string) => {
                  throw new Error('FailedError');
                });

                expect(() => retrier.retrySync(callback, ['success'])).toThrow(
                  'FailedError',
                );
                expect(callback).toHaveBeenCalledTimes(MAX_RETRIES_CUSTOM + 1);
                expect(retrier.getOnFailure()?.callback).toHaveBeenCalledTimes(
                  1,
                );

                retrier.setOnFailure(ONFAILURE_ASYNC_RETURNS_VOID);

                const callbackAsync = jest.fn((success) => {
                  return new Promise((_, reject) => {
                    reject(() => {
                      throw new Error('FailedErrorAsync');
                    });
                  });
                });

                const resultAsync = retrier.retryAsync(callbackAsync, [1, 2]);

                await expect(resultAsync).rejects.toThrow('FailedErrorAsync');
                expect(callbackAsync).toHaveBeenCalledTimes(
                  MAX_RETRIES_CUSTOM + 1,
                );
                expect(retrier.getOnFailure()?.callback).toHaveBeenCalledTimes(
                  1,
                );
              });
              test('Failed after MAX_RETRIES_CUSTOM + 1 attempts, throws onFailure callback error', async () => {
                const retrier = new Retrier({
                  maxRetries: MAX_RETRIES_CUSTOM,
                  onFailure: ONFAILURE_SYNC_THROWS_ERROR,
                });

                const callback = jest.fn((success: string) => {
                  throw new Error('FailedError');
                });

                expect(() => retrier.retrySync(callback, ['success'])).toThrow(
                  'OnFailureError',
                );
                expect(callback).toHaveBeenCalledTimes(MAX_RETRIES_CUSTOM + 1);
                expect(retrier.getOnFailure()?.callback).toHaveBeenCalledTimes(
                  1,
                );

                retrier.setOnFailure(ONFAILURE_ASYNC_THROWS_ERROR);

                const callbackAsync = jest.fn((success) => {
                  return new Promise((_, reject) => {
                    reject(() => {
                      throw new Error('FailedErrorAsync');
                    });
                  });
                });

                const resultAsync = retrier.retryAsync(callbackAsync, [1, 2]);

                await expect(resultAsync).rejects.toThrow(
                  'OnFailureErrorAsync',
                );
                expect(callbackAsync).toHaveBeenCalledTimes(
                  MAX_RETRIES_CUSTOM + 1,
                );
                expect(retrier.getOnFailure()?.callback).toHaveBeenCalledTimes(
                  1,
                );
              });
            });
            describe('with override', () => {
              test('Failed after MAX_RETRIES_CUSTOM + 1 attempts, returns 85', async () => {
                const retrier = new Retrier({
                  maxRetries: MAX_RETRIES_CUSTOM,
                  onFailure: ONFAILURE_SYNC_RETURNS_85,
                });

                const callback = jest.fn((success: string) => {
                  throw new Error('FailedError');
                });

                expect(retrier.retrySync(callback, ['success'])).toBe(85);
                expect(callback).toHaveBeenCalledTimes(MAX_RETRIES_CUSTOM + 1);
                expect(retrier.getOnFailure()?.callback).toHaveBeenCalledTimes(
                  1,
                );

                retrier.setOnFailure(ONFAILURE_ASYNC_RETURNS_85);

                const callbackAsync = jest.fn((success) => {
                  return new Promise((_, reject) => {
                    reject(() => {
                      throw new Error('FailedErrorAsync');
                    });
                  });
                });

                const resultAsync = retrier.retryAsync(callbackAsync, [1, 2]);

                await expect(resultAsync).resolves.toBe(85);
                expect(callbackAsync).toHaveBeenCalledTimes(
                  MAX_RETRIES_CUSTOM + 1,
                );
                expect(retrier.getOnFailure()?.callback).toHaveBeenCalledTimes(
                  1,
                );
              });
            });
          });
        });
      });
      // TODO
      describe('Set on the function', () => {
        describe('maxRetries', () => {
          test('Should throw error after MAX_RETRIES_CUSTOM + 1 attemps', async () => {
            const retrier = new Retrier();
            const callback = jest.fn((_success: string) => {
              throw new Error('FailedError');
            });

            expect(() =>
              retrier.retrySync(callback, ['success'], {
                maxRetries: MAX_RETRIES_CUSTOM,
              }),
            ).toThrow('FailedError');
            expect(callback).toHaveBeenCalledTimes(MAX_RETRIES_CUSTOM + 1);

            const callbackAsync = jest.fn((success) => {
              return new Promise((_, reject) => {
                reject(() => {
                  throw new Error('FailedErrorAsync');
                });
              });
            });

            const resultAsync = retrier.retryAsync(callbackAsync, [1, 2], {
              maxRetries: MAX_RETRIES_CUSTOM,
            });

            await expect(resultAsync).rejects.toThrow('FailedErrorAsync');
            expect(callbackAsync).toHaveBeenCalledTimes(MAX_RETRIES_CUSTOM + 1);
          });
        });
        describe('onFailure', () => {
          describe('without override', () => {
            test('Failed after MAX_RETRIES_CUSTOM + 1 attempts', async () => {
              const retrier = new Retrier();

              const callback = jest.fn((success: string) => {
                throw new Error('FailedError');
              });

              expect(() =>
                retrier.retrySync(callback, ['success'], {
                  maxRetries: MAX_RETRIES_CUSTOM,
                  onFailure: ONFAILURE_SYNC_RETURNS_VOID,
                }),
              ).toThrow('FailedError');
              expect(callback).toHaveBeenCalledTimes(MAX_RETRIES_CUSTOM + 1);

              const callbackAsync = jest.fn((success) => {
                return new Promise((_, reject) => {
                  reject(() => {
                    throw new Error('FailedErrorAsync');
                  });
                });
              });

              const resultAsync = retrier.retryAsync(callbackAsync, [1, 2], {
                maxRetries: MAX_RETRIES_CUSTOM,
                onFailure: ONFAILURE_ASYNC_RETURNS_VOID,
              });

              await expect(resultAsync).rejects.toThrow('FailedErrorAsync');
              expect(callbackAsync).toHaveBeenCalledTimes(
                MAX_RETRIES_CUSTOM + 1,
              );
            });
            test('Failed after MAX_RETRIES_CUSTOM + 1 attempts, throws onFailure callback error', async () => {
              const retrier = new Retrier();

              const callback = jest.fn((success: string) => {
                throw new Error('FailedError');
              });

              expect(() =>
                retrier.retrySync(callback, ['success'], {
                  maxRetries: MAX_RETRIES_CUSTOM,
                  onFailure: ONFAILURE_SYNC_THROWS_ERROR,
                }),
              ).toThrow('OnFailureError');
              expect(callback).toHaveBeenCalledTimes(MAX_RETRIES_CUSTOM + 1);

              const callbackAsync = jest.fn((success) => {
                return new Promise((_, reject) => {
                  reject(() => {
                    throw new Error('FailedErrorAsync');
                  });
                });
              });

              const resultAsync = retrier.retryAsync(callbackAsync, [1, 2], {
                maxRetries: MAX_RETRIES_CUSTOM,
                onFailure: ONFAILURE_ASYNC_THROWS_ERROR,
              });

              await expect(resultAsync).rejects.toThrow('OnFailureErrorAsync');
              expect(callbackAsync).toHaveBeenCalledTimes(
                MAX_RETRIES_CUSTOM + 1,
              );
            });
          });
          describe('with override', () => {
            test('Failed after MAX_RETRIES_CUSTOM + 1 attempts, returns 85', async () => {
              const retrier = new Retrier({
                maxRetries: MAX_RETRIES_CUSTOM,
              });

              const callback = jest.fn((success: string) => {
                throw new Error('FailedError');
              });

              expect(
                retrier.retrySync(callback, ['success'], {
                  maxRetries: MAX_RETRIES_CUSTOM,
                  onFailure: ONFAILURE_SYNC_RETURNS_85,
                }),
              ).toBe(85);
              expect(callback).toHaveBeenCalledTimes(MAX_RETRIES_CUSTOM + 1);

              const callbackAsync = jest.fn((success) => {
                return new Promise((_, reject) => {
                  reject(() => {
                    throw new Error('FailedErrorAsync');
                  });
                });
              });

              const resultAsync = retrier.retryAsync(callbackAsync, [1, 2], {
                maxRetries: MAX_RETRIES_CUSTOM,
                onFailure: ONFAILURE_ASYNC_RETURNS_85,
              });

              await expect(resultAsync).resolves.toBe(85);
              expect(callbackAsync).toHaveBeenCalledTimes(
                MAX_RETRIES_CUSTOM + 1,
              );
            });
          });
        });
      });
    });
  });
  //#endregion
});
