
async function getAllProducts() {
  const response = await fetch("https://opulent-space-spoon-vqp7gggvgp5c996-3001.app.github.dev/api/product")
  const data = await response.json();
  return data;
}



const productServices = {
  getAllProducts,

};
export default productServices;