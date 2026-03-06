let cart = [];

const getCart = () => {
  return cart;
};

const addProduct = (product) => {

  const existingProduct = cart.find(p => p.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  return cart;
};

const decreaseProduct = (product) => {

  const existingProduct = cart.find(p => p.id === product.id);

  if (!existingProduct) return cart;

  if (existingProduct.quantity === 1) {
    cart = cart.filter(p => p.id !== product.id);
  } else {
    existingProduct.quantity -= 1;
  }

  return cart;
};

const removeProduct = (product) => {
  cart = cart.filter(p => p.id !== product.id);
  return cart;
};

const clearCart = () => {
  cart = [];
};

export default {
  getCart,
  addProduct,
  decreaseProduct,
  removeProduct,
  clearCart
};