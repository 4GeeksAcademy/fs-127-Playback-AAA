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
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { Success } from "./pages/Success"


import Profile from "./pages/Profile";
import { PrivateRoute } from "./components/PrivateRoute";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={ <PrivateRoute> <Demo /> </PrivateRoute> } />
      <Route path="/products" element={<PageProducts />} />
      <Route path="/product/:id" element={<PageDetailProduct />} />
      <Route path="/favorites" element={ <PrivateRoute> <PageFavorites /> </PrivateRoute> } />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={ <PrivateRoute> <Profile /> </PrivateRoute> }/>
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/success/:orderId" element={<Success />} />
    </Route>
  )
);
