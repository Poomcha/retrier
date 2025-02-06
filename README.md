# Retrier

`Retrier` is a lightweight and flexible library for managing retries of synchronous and asynchronous operations in JavaScript/TypeScript. It allows you to specify a maximum number of retries and a delay between attempts, along with optional success and failure handlers.

## Installation

To install `retrier`, use npm or yarn:

```bash
npm install retrier
```

or

```bash
yarn add retrier
```

## Usage

### Importing

Import the Retrier class and its methods into your project:

```typescript
import { Retrier, retrySync, retryAsync } from "retrier";
```

### Configuration

Create an instance of Retrier with custom configuration options:

```typescript
const retrier = new Retrier({
  maxRetries: 5, // Maximum number of retries
  delay: 1000, // Delay between retries in milliseconds
  onSuccess: {
    // Callback on success
    callback: (result) => console.log("Operation succeeded:", result),
    override: true, // Override default behavior
  },
  onFailure: {
    // Callback on failure
    callback: (error) => console.error("Operation failed:", error),
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
  if (Math.random() > 0.5) throw new Error("Random failure");
  return "Success";
});

console.log(result);
```

#### retryAsync

Retries an asynchronous operation:

```typescript
const result = await retrier.retryAsync(async () => {
  // Your asynchronous operation here
  if (Math.random() > 0.5) throw new Error("Random failure");
  return "Success";
});

console.log(result);
```

### Static Methods

You can also use the static methods without instantiating the class:

#### retrySync

```typescript
const result = retrySync(5, () => {
  // Your synchronous operation here
  if (Math.random() > 0.5) throw new Error("Random failure");
  return "Success";
});

console.log(result);
```

#### retryAsync

```typescript
const result = await retryAsync(5, async () => {
  // Your asynchronous operation here
  if (Math.random() > 0.5) throw new Error("Random failure");
  return "Success";
});

console.log(result);
```

### Options

- maxRetries: Maximum number of retries (default: 2).
- delay: Delay between retries in milliseconds (default: 0).
- onSuccess: Callback executed on success.
- callback: Function to run on success.
- args: Additional arguments for the callback.
- override: If true, overrides the default behavior.
- onFailure: Callback executed on failure.
- callback: Function to run on failure.
- args: Additional arguments for the callback.
- override: If true, overrides the default behavior.

### Examples

#### Success Example

```typescript
const retrier = new Retrier({
  maxRetries: 3,
  onSuccess: {
    callback: (result) => console.log("Operation succeeded:", result),
    override: true,
  },
});

const result = retrier.retrySync(() => {
  return "Operation completed";
});

// Output: Operation succeeded: Operation completed
```

#### Failure Example
```typescript
const retrier = new Retrier({
maxRetries: 3,
onFailure: {
callback: (error) => console.error('Operation failed:', error.message),
override: true
}
});

const result = retrier.retrySync(() => {
throw new Error('Operation failed');
});

// Output: Operation failed: Operation failed
```

## License
This project is licensed under the ISC License.
