const API_KEY = "73cbc448c840ab7c4e8ab0de047dd1b07dd322303dc6c96693f82e335e78d53d";
const BASE = "https://apiv1.geoapi.es";

async function getCommunities() {
  const res = await fetch(`${BASE}/comunidades?type=JSON&version=2024.01&key=${API_KEY}`);
  const data = await res.json();
  return data.data || [];
}

async function getProvinces(ccom) {
  const res = await fetch(`${BASE}/provincias?CCOM=${ccom}&tipo=JSON&key=${API_KEY}`);
  const data = await res.json();
  return data.data || [];
}

async function getMunicipalities(cpro) {
  const res = await fetch(`${BASE}/municipios?CPRO=${cpro}&tipo=JSON&key=${API_KEY}`);
  const data = await res.json();
  return data.data || [];
}

async function getPostalCode(cmun, cpro) {
  const cmum = cmun.slice(0, -2);
  const res = await fetch(`${BASE}/codigos_postales?CPRO=${cpro}&CMUM=${cmum}&type=JSON&version=2024.01&key=${API_KEY}`);
  const data = await res.json();
  return data.data?.[0]?.CPOS || "";
}

const geoService = { getCommunities, getProvinces, getMunicipalities, getPostalCode };
export default geoService;