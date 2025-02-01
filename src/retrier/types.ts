interface EffectCallback<T> {
  callback: (...args: any) => T | Promise<T>;
  args?: any[];
  override?: boolean;
}

type RetryOptionsSync<OnSuccess, OnFailure> = {
  onSuccess?: EffectCallback<OnSuccess>;
  onFailure?: EffectCallback<OnFailure>;
};

type RetryOptionsAsync<OnSuccess, OnFailure> = {
  delay?: number;
} & RetryOptionsSync<OnSuccess, OnFailure>;

type RetrierOptions<OnSuccess, OnFailure> = {
  maxRetries?: number;
} & RetryOptionsAsync<OnSuccess, OnFailure>;

type SetRetrierOptions<OnSuccess, OnFailure> = {
  maxRetries: number;
  delay: number;
  onSuccess?: EffectCallback<OnSuccess>;
  onFailure?: EffectCallback<OnFailure>;
};

export type {
  EffectCallback,
  RetrierOptions,
  RetryOptionsAsync,
  RetryOptionsSync,
  SetRetrierOptions,
};
