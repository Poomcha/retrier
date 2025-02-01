# Retrier

Provide functions to retry sync or async operation, and handlers for success or failure cases.

## Installation

### Package manager

Using npm:

```bash
$ npm install @poomcha/retrier
```

Once the package is install, you can import the library:

```ts
import { Retrier, retrySync, retryAsync } from "@poomcha/retrier";
```

## Example

```ts
import { Retrier, retrySync } from "@poomcha/retrier";

const onSuccess = {
  callback: function (res, success) {
    console.log(success);
  },
  args: ["success!"],
  override: false,
};

const onFailure = {
  callback: function (res, error) {
    console.log(error);
  },
  args: ["error!"],
  override: false,
};

// With instanciation
const retrier = new Retrier({
  maxRetries: 2,
  onSuccess: onSuccess,
  onFailure: onFailure,
});

let attempt = 0;
const op = function (a) {
  if (attempt === 2) {
    return `success with ${a}`;
  } else {
    attempt++;
    throw new Error("opError");
  }
};

const resWithInstanciation = retrier.retrySync(op, [10]);

// Without instanciation
attempt = 0;
const resWithoutInstanciation = retrySync(2, op, [10], {
  onSuccess: onSuccess,
  onFailure: onFailure,
});
```
