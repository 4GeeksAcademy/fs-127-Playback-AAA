export const initialStore = () => {
  return {
    message: null,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ],
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    isAuthenticated: !!localStorage.getItem("token"),
  }
}

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };

    case 'add_task': {
      const { id, color } = action.payload
      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
    }

    case 'login': {
      const { token, user } = action.payload;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return {
        ...store,
        token,
        user,
        isAuthenticated: true,
      };
    }

    case 'set_user':
      return {
        ...store,
        user: action.payload,
      };

    case 'logout':
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        ...store,
        token: null,
        user: null,
        isAuthenticated: false,
      };

    default:
      throw Error('Unknown action.');
  }
}