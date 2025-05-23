# Retrier

`Retrier` is a lightweight and flexible library for managing retries of synchronous and asynchronous operations in JavaScript/TypeScript. It allows you to specify a maximum number of retries and a delay between attempts, along with optional success and failure handlers.

## Installation

To install `retrier`, use npm or yarn:

```bash
npm install @poomcha/retrier
```

or

```bash
yarn add @poomcha/retrier
```

## Usage

### Importing

Import the Retrier class and its methods into your project:

```typescript
import { Retrier, retrySync, retryAsync } from '@poomcha/retrier';
```

### Configuration

Create an instance of Retrier with custom configuration options:

```typescript
const retrier = new Retrier({
  maxRetries: 5, // Maximum number of retries
  delay: 1000, // Delay between retries in milliseconds
  onSuccess: {
    // Callback on success
    callback: (result) => console.log('Operation succeeded:', result),
    override: true, // Override default behavior
  },
  onFailure: {
    // Callback on failure
    callback: (error) => console.error('Operation failed:', error),
    override: true, // Override default behavior
  },
});
```

### Methods

#### retrySync

Retries a synchronous operation:

```typescript
const result = retrier.retrySync(() => {
  // Your synchronous operation here
  if (Math.random() > 0.5) throw new Error('Random failure');
  return 'Success';
});

console.log(result);
```

#### retryAsync

Retries an asynchronous operation:

```typescript
const result = await retrier.retryAsync(async () => {
  // Your asynchronous operation here
  if (Math.random() > 0.5) throw new Error('Random failure');
  return 'Success';
});

console.log(result);
```

### Static Methods

You can also use the static methods without instantiating the class:

#### retrySync

```typescript
const result = retrySync(5, () => {
  // Your synchronous operation here
  if (Math.random() > 0.5) throw new Error('Random failure');
  return 'Success';
});

console.log(result);
```

#### retryAsync

```typescript
const result = await retryAsync(5, async () => {
  // Your asynchronous operation here
  if (Math.random() > 0.5) throw new Error('Random failure');
  return 'Success';
});

console.log(result);
```

### Options

- maxRetries: Maximum number of retries (default: 2).
- delay: Delay between retries in milliseconds (default: 0).
- onSuccess: Callback executed on success.
- onSuccess.callback: Function to run on success.
- onSuccess.args: Additional arguments for the callback.
- onSuccess.override: If true, overrides the default behavior.
- onFailure: Callback executed on failure.
- onFailure.callback: Function to run on failure.
- onFailure.args: Additional arguments for the callback.
- onFailure.override: If true, overrides the default behavior.

### Examples

#### Success Example

```typescript
const retrier = new Retrier({
  maxRetries: 3,
  onSuccess: {
    callback: (result) => console.log('Operation succeeded:', result),
    override: true,
  },
});

const result = retrier.retrySync(() => {
  return 'Operation completed';
});

// Output: Operation succeeded: Operation completed
```

#### Failure Example

```typescript
const retrier = new Retrier({
  maxRetries: 3,
  onFailure: {
    callback: (error) => console.error('Operation failed:', error.message),
    override: true,
  },
});

const result = retrier.retrySync(() => {
  throw new Error('Operation failed');
});

// Output: Operation failed: Operation failed
```

#### Complex context

```typescript
import { Retrier } from '@poomcha/retrier';

export class Example {
  private client;

  private retrier;
  private readonly retrierOptions = {
    maxRetries: 2,
    delay: 1000,
    onSuccess: {
      callback: function (_res) {
        return;
      },
      args: [],
      override: false,
    },
    onFailure: {
      callback: function (error) {
        console.error(error);

        return `Error: Example Unavailable.`;
      },
      args: [],
      override: true,
    },
  };

  constructor() {
    this.client = new ExampleClient();
    this.retrier = new Retrier(this.retrierOptions);
  }

  public async queryExample(apiCallOptions) {
    const callApi = async function (options) {
      return await this.client.exampleGet(apiCallOptions);
    };

    const apiCallOptions = {
      // ...
    };

    // In context such as classes, make sure to bind this to your callback to keep track of the context
    const response = await this.retrier.retryAsync(queryExample.bind(this), [
      apiCallOptions,
    ]);

    return response;
  }
}
```

## License

This project is licensed under the ISC License.
