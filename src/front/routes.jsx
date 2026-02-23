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
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { PageProducts } from "./pages/PageProducts";
import { PageDetailProduct } from "./pages/PageDetailProduct";
import Profile from "./pages/Profile";

import { PrivateRoute } from "./components/PrivateRoute";

export const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

        <Route path= "/" element={<Home />} />
        <Route path="/single/:theId" element={ <Single />} />
        <Route path="/demo" element={<PrivateRoute><Demo /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<PageProducts />} />
        <Route path="/products/:category" element={<PageProducts />} />
        <Route path="/products/:category/:subcategory" element={<PageProducts />} />
        <Route path="/PageDetailProduct/:id" element={<PageDetailProduct />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Route>
    )
);
