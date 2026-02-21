const URL = "https://opulent-space-spoon-vqp7gggvgp5c996-3001.app.github.dev/api/product";

async function getAllProducts() {
  const response = await fetch(URL)
  const data = await response.json();
  return data;
}
async function getProduct(id) {
  const response = await fetch(`${URL}/${id}`);
  const data = await response.json();
  return data;
}

async function createProduct(body) {
  const response = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  return data;
}
async function updateProduct(id, body) {
  const response = await fetch(`${URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  return data;
}

async function deleteProduct(id) {
  const response = await fetch(`${URL}/${id}`, {
    method: "DELETE"
  });
  const data = await response.json();
  return data;
}


const productServices = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  
};
export default productServices;
