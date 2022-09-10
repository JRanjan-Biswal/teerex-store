import './ProductCard.css'



const ProductCard = ({productId, productImage, productName, productPrice, productType, productGender, productColor, productQuantity, handleAdd }) => {

    return (
        <div className='product-card-container'>
            <div className='product-card-image'>
                <img src={productImage} alt={productName} />
            </div>
            <div className='product-card-info'>
                <div className='product-card-price'>₹{productPrice}</div>
                <div className='product-card-price'>{productName}</div>
                {/* <div className='product-card-price'>{productGender}</div>
                <div className='product-card-price'>{productColor}</div> */}
                <div>
                    <button className='product-card-button' onClick={() => handleAdd(productId, "+1")}>Add To Cart</button>
                </div>
            </div>
        </div>
    )
}


export default ProductCard;