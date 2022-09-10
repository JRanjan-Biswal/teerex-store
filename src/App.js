import './App.css';
import { Route, Routes as Switch } from "react-router-dom";
import Product from './components/Product';
import Footer from './components/Footer';
import CheckoutPage from './components/CheckoutPage'


export const config = {endpoint: "https://geektrust.s3.ap-southeast-1.amazonaws.com/coding-problems/shopping-cart/catalogue.json"}

function App() {
  return (
    <div className="App">
      {/* <CheckoutPage /> */}
      <Switch>
        <Route path ="/" element={<Product />} />
        <Route path = "/cart" element={<CheckoutPage />} />
      </Switch>
      <Footer />
    </div>
  );
}

export default App;
