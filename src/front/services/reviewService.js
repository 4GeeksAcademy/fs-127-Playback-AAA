const backendUrl = import.meta.env.VITE_BACKEND_URL;

async function getAllReviews() {
  const response = await fetch(`${backendUrl}/api/review`);
  const data = await response.json();
  return data;
}



const reviewServices = {
  getAllReviews,

};
export default reviewServices;