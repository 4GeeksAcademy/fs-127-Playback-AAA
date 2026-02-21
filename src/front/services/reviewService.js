
async function getAllReviews() {
  const response = await fetch("https://opulent-space-spoon-vqp7gggvgp5c996-3001.app.github.dev/api/review")
  const data = await response.json();
  return data;
}



const reviewServices = {
  getAllReviews,

};
export default reviewServices;