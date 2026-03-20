// Import necessary components and functions from react-router-dom.

import { createBrowserRouter, createRoutesFromElements, Route, } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { PageProducts } from "./pages/PageProducts";
import { PageDetailProduct } from "./pages/PageDetailProduct";
import { SearchPage } from "./pages/SearchPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { PageCart } from "./pages/PageCart";
import { Checkout } from "./pages/Checkout";
import { MyOrders } from "./pages/MyOrders";
import Profile from "./pages/Profile";
import { PrivateRoute } from "./components/Common/PrivateRoute";
import {StripeReturn} from "./pages/StripeReturn";
import {StripeRefresh} from "./pages/StripeRefresh";
import {About} from "./pages/About";
import ContactPage from "./pages/ContactPage";


export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route path="/" element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={ <PrivateRoute> <Demo /> </PrivateRoute> } />
      <Route path="/products" element={<PageProducts />} />
      <Route path="/product/:id" element={<PageDetailProduct />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/profile" element={ <PrivateRoute> <Profile /> </PrivateRoute> }/>
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/cart" element={<PageCart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
      <Route path="/seller/stripe/return" element={<StripeReturn />} />
      <Route path="/seller/stripe/refresh" element={<StripeRefresh />} />
      <Route path="/about" element={<About />} />
<Route path="/contact" element={<ContactPage />} />
      </Route>
    )
);
