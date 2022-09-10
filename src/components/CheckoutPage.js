import './CheckoutPage.css';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Snackbar from "./Snackbar"
import { handleCartQuantity } from './Product';
import Header from './Header';


const CheckoutPage = () => {

    // location from react-router-dom provides us to have access to the data items
    // that was send through state attribute in Header.js file 
    let location = useLocation();
    let data = location.state.data;

    let itemsInLocalStorage = JSON.parse(localStorage.getItem("userCartItems"));
    let items = !itemsInLocalStorage ? [] : itemsInLocalStorage;

    const [cartData, setCartData] = useState(items)
    const [errorMessage, setErrorMessage] = useState([items.length === 0 ? "No items Available" : "", items.length === 0 ? true : false]);
    const [totalValue, setTotalValue] = useState(0)

    // calculate total cost i.e., item.price x item.quantityByUser
    useEffect(() => {
        if (cartData.length) {
            let total = cartData.reduce((acc, item) => acc + (item.price * item.quantityByUser), 0)
            setTotalValue(total)
        } else {
            setTotalValue(0)
        }
    }, [cartData])

    // increase the item quantity, when " + " is clicked on
    const handleAdd = (id, quantity) => {
        let cart = handleCartQuantity(id, quantity, items, data);
        if (typeof cart === 'string') {
            setErrorMessage([cart, true])
            return;
        }
        setCartData(cart)
    }

    // decrease the item quantity when " - " is clicked on
    const handleDelete = (id, quantity) => {
        let cart = handleCartQuantity(id, quantity, items, data);
        if (typeof cart === 'string') {
            setErrorMessage([cart, true])
            return;
        }
        setCartData(cart)
        !cart.length && (setErrorMessage(["Please Add some items to checkout", true]))
    }


    // closes the snackbar error message
    const closeSnackBar = () => {
        setErrorMessage(["", false]);
    }


    return (
        <div>
            <Header />
            <div className='cart-container'>
                {errorMessage[1] === true && <Snackbar closeSnackBar={() => closeSnackBar()} message={errorMessage} />}

                <div className='cart-total'>Total: ₹{totalValue}</div>

                {
                    cartData.length === 0 &&
                    <div className='item-not-available'>No items available</div>
                }
                {
                    cartData.length > 0 &&
                    cartData.map(item =>
                        <div className='cart-item' key={item.id}>
                            <div className='cart-image'>
                                <img src={item.imageURL} alt={item.name} />
                            </div>
                            <div>
                                <div className='cart-name'>{item.name}</div>
                                <div>₹{item.price}</div>
                            </div>
                            <div className='add-cart-items' onClick={() => handleAdd(item.id, "+1")} >+</div>
                            <div className='quantity-cart-items'>Qty: {item.quantityByUser}</div>
                            <div className='sub-cart-items' onClick={(() => handleDelete(item.id, "-1"))}>-</div>
                        </div>
                    )
                }

            </div>
        </div>
    )
}

export default CheckoutPage;