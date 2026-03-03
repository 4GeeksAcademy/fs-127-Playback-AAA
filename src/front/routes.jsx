// Import necessary components and functions from react-router-dom.

import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { PageProducts } from "./pages/PageProducts";
import { PageDetailProduct } from "./pages/PageDetailProduct";
import { PageFavorites } from "./pages/PageFavorites";
import { SearchPage } from "./pages/SearchPage";
import { PageCart } from "./pages/PageCart";
import { Checkout } from "./pages/Checkout";
import Profile from "./pages/Profile";

import { PrivateRoute } from "./components/PrivateRoute";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
        <Route path= "/" element={<Home />} />
        <Route path="/single/:theId" element={ <Single />} />
        <Route path="/demo" element={<PrivateRoute><Demo /></PrivateRoute>} />
        <Route path="/products" element={<PageProducts />} />
        <Route path="/products/:category" element={<PageProducts />} />
        <Route path="/products/:category/:subcategory" element={<PageProducts />} />
        <Route path="/PageDetailProduct/:id" element={<PageDetailProduct />} />
        <Route path="/:userEmail/favorites" element={<PageFavorites />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/cart" element={<PageCart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
    )
);
