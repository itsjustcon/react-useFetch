# react-useFetch
React hooks for the Fetch API

Inspired by the amazing [`@apollo/client`](https://www.apollographql.com/docs/react/api/react/hooks/) react hooks.

## Install
```
npm install --save @itsjustcon/react-usefetch
```

## Usage

### `useFetch()`
The `useFetch()` method is most common way to use this package.

```javascript
const { useFetch } = require('@itsjustcon/react-usefetch');

function MyComponent() {
    const { loading: isLoadingTodos, body: todos } = useFetch('https://jsonplaceholder.typicode.com/todos', {
        mode: 'cors',
        cache: 'no-cache',
    });
    return (
        <div>
            {isLoadingTodos ? (
                <LoadingSpinner />
            ) : (
                <div>
                    {todos.map((todo) =>
                        <div key={todo.id}>
                            {todo.title}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
```

### `useLazyFetch`
The `useLazyFetch()` method allows you to delay the execution of a `fetch`.
This is commonly used for things like fetching after a button is pressed.

```javascript
const { useLazyFetch } = require('@itsjustcon/react-usefetch');

function MyComponent() {
    const [fetchTodos, { loading: isLoadingTodos, body: todos }] = useLazyFetch('https://jsonplaceholder.typicode.com/todos', {
        mode: 'cors',
        cache: 'no-cache',
    });
    return (
        <div>
            <button
                onClick={(event) => {
                    event.preventDefault();
                    fetchTodos();
                }}
                disabled={isLoadingTodos}
            >
                Fetch Todos
            </button>
            {isLoadingTodos ? (
                <LoadingSpinner />
            ) : todos ? (
                <div>
                    {todos.map((todo) =>
                        <div key={todo.id}>
                            {todo.title}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}
```

## API
Detailed documentation coming soon