import React from "react";
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';


const Header = ({ totalCartQuantity, data }) => {
    const navigate = useNavigate()
    const params = window.location.pathname
    
    return (
        <div className="header-container">
            <div className="header-logo" onClick={() => navigate("/")}>TeeRex Store</div>
            <div className="header-items">
                <div className="header-items-product" onClick={() => navigate("/")} >Products</div>
                <div className="header-items-cart">
                    {params === "/" ?
                        <div className="cart-svg">
                            <Link to="/cart" state={{ data }} >
                                <img src="cart.svg" alt="" />
                                <div className="item-in-cart">{totalCartQuantity}</div>
                            </Link>
                        </div>
                        :
                        "Cart"}
                </div>
            </div>
        </div>
    )
}

export default Header;