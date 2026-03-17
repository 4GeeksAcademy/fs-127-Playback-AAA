export const initialStore = () => {

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || "guest";
  const savedCart = localStorage.getItem(`cart_${userId}`);

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
    user: user || null,
    isAuthenticated: !!localStorage.getItem("token"),
    favorites: [],
    cart: savedCart ? JSON.parse(savedCart) : []
  }
}

export default function storeReducer(store, action = {}) {
  switch (action.type) {

    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };

    case 'fav_add':
      return {
        ...store,
        favorites: [...store.favorites, action.payload]
      };

    case 'fav_delete':
      return {
        ...store,
        favorites: store.favorites.filter(fav => fav.id !== action.payload.id)
      };

    case 'set_favorites':
      return { ...store, favorites: action.payload };

    case 'add_task': {
      const { id, color } = action.payload
      return {
        ...store,
        todos: store.todos.map((todo) =>
          (todo.id === id ? { ...todo, background: color } : todo)
        )
      };
    }

    case 'login': {
      const { token, user } = action.payload;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const userId = user?.id || "guest";
      const savedCart = localStorage.getItem(`cart_${userId}`);

      return {
        ...store,
        token,
        user,
        isAuthenticated: true,
        cart: savedCart ? JSON.parse(savedCart) : []
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
        cart: []
      };

    case 'set_cart': {
      const userId = store.user?.id || "guest";
      localStorage.setItem(`cart_${userId}`, JSON.stringify(action.payload));

      return {
        ...store,
        cart: action.payload
      };
    }

    case 'cart_add': {
      const exists = store.cart.find(item => item.id === action.payload.id);

      let newCart;

      if (exists) {
        newCart = store.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newCart = [...store.cart, action.payload];
      }

      const userId = store.user?.id || "guest";
      localStorage.setItem(`cart_${userId}`, JSON.stringify(newCart));

      return {
        ...store,
        cart: newCart
      };
    }

    case 'cart_remove': {
      const newCart = store.cart.filter(item => item.id !== action.payload.id);

      const userId = store.user?.id || "guest";
      localStorage.setItem(`cart_${userId}`, JSON.stringify(newCart));

      return {
        ...store,
        cart: newCart
      };
    }

    default:
      throw Error('Unknown action.');
  }
}