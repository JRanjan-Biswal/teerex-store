import React, { useEffect, useState } from "react";
import "./Product.css";
import ProductCard from "./ProductCard";
import Header from "./Header"
import { config } from "../App"
import Snackbar from "./Snackbar"

export const handleCartQuantity = (id, quantity, cartItems, data) => {

	let newItemsInCart;
	let itemAlreadyAvailableInCart = false;
	let itemToRemove = false;
	let message = "";

	// loop over cart items to check if the selected item is already available inside the cart. 
	// if available then increment the quantity , and set "itemAlreadyAvailableInCart=true"
	// if not available in cart that means it has to be added
	let currentCartItems = cartItems.map((item, index) => {
		if (item.id === id) {
			itemAlreadyAvailableInCart = true;
			if (item.quantityByUser === item.quantity && quantity === "+1") {
				message = `${item.name} is high in demand. So quantity per individual is limited to ${item.quantityByUser} only. Sorry for inconvenience. `;
				return item;
			}
			if (item.quantityByUser === 1 && quantity === "-1") {
				itemToRemove = `${index}`
				return null;
			}
			item.quantityByUser += +(quantity);
			return item;
		}
		return item
	})

	// if there is a message that means no some error so throw the error and return from here
	if (message.length > 0) {
		return message
	}

	// when we are decrease the quantity, if any quantity become zero, 
	// the above "cartItems.map" returns undefined for the same and sets (itemToRemove=index), here index is of the element that need to be removed
	// thus check for that undefined and remove it from the cart array
	if (itemToRemove) {
		currentCartItems.splice(itemToRemove, 1);
		localStorage.setItem("userCartItems", JSON.stringify(currentCartItems));
		return currentCartItems
	}

	// " itemAlreadyAvailableInCart = false " that means them is not in cart, so find that item from  the data and add it to the cartArray 
	// Note: check if the quantity == 0 of the item that need to be added, that means no quantity , thus just return an error message
	if (!itemAlreadyAvailableInCart) {
		newItemsInCart = data.filter(item => item.id === id)
		if (!newItemsInCart[0].quantity) {
			return message = `${newItemsInCart[0].name} is not available at the moment. Sorry for inconvenience. `;
		}
		newItemsInCart[0].quantityByUser = +quantity
	}

	// if item not present in cart and the cart is completely empty then add the first element to localStorage
	if (!itemAlreadyAvailableInCart && cartItems.length === 0) {
		localStorage.setItem("userCartItems", JSON.stringify(newItemsInCart))
		return newItemsInCart
	}

	// if cart is not empty then add the element at the end of the cart
	if (!itemAlreadyAvailableInCart && cartItems.length > 0) {
		localStorage.setItem("userCartItems", JSON.stringify([...cartItems, ...newItemsInCart]))
		return [...cartItems, ...newItemsInCart]
	}

	localStorage.setItem("userCartItems", JSON.stringify(currentCartItems))
	return currentCartItems

}



const Product = () => {
	const [data, setData] = useState("");
	const [filteredData, setFilteredData] = useState({
		newData: [],
		filterOccurred: false
	});
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({ color: [], type: [], gender: [], price: [], name: [] });
	const [errorMessage, setErrorMessage] = useState(["", false]);
	const [cartItems, setCartItems] = useState([])
	const [totalCartQuantity, setTotalCartQuantity] = useState("")

	useEffect(() => {
		performGetApiCall();
		const items = JSON.parse(localStorage.getItem("userCartItems"))
		items && setCartItems(items)
	}, []);

	const performGetApiCall = async () => {
		const res = await fetch(`${config.endpoint}`);
		const response = await res.json();
		setLoading(false);
		setData(response);
	};


	const addFilters = (event) => {
		//name of filter i.e., color, type, price, gender
		const filterName = event.target.name;

		// value of the filter selected i.e., red, green, blue, polo, basic, 250-450, etc;
		const filterValue = event.target.value;

		//if true that means the target element is selected, if false that means target element is unchecked
		const filterCheckBoxSelected = event.target.checked;

		// if any filter is unchecked than remove that element from the "filters state" array
		if (!filterCheckBoxSelected) {
			const currentFilter = [...filters[filterName]];
			const newFilterAfterRemovingUncheckedFilter = currentFilter.filter(item => item !== filterValue);
			setFilters(() => { return { ...filters, [filterName]: newFilterAfterRemovingUncheckedFilter } })
			return;
		}

		// add the filter that is selected
		setFilters(() => { return { ...filters, [filterName]: [...filters[filterName], filterValue] } })
	}


	// if filters are selected then do the data filtration, whenever the filters change invoke the function inside
	useEffect(() => {
		if (data.length > 0) {
			perFormDataFiltration()
		}

	}, [filters])


	//data filtration based on the filters selected by the user 
	const perFormDataFiltration = () => {

		let dataAfterFiltration = data;
		const colorFilter = filters.color;
		const typeFilter = filters.type;
		const genderFilter = filters.gender;
		const priceFilter = filters.price;
		const nameFilter = filters.name;

		if (nameFilter.length > 0) {
			const inputSearchBar = nameFilter[0].split(" ").map(item => item[0].toUpperCase() + item.slice(1)).join(" ");
			dataAfterFiltration = dataAfterFiltration.filter(item => item.name.includes(`${inputSearchBar}`));
		}
		if (colorFilter.length > 0) {
			dataAfterFiltration = dataAfterFiltration.filter(item => colorFilter.find(itemColor => item.color === itemColor))
		}
		if (typeFilter.length > 0) {
			dataAfterFiltration = dataAfterFiltration.filter(item => typeFilter.find(itemType => item.type === itemType));
		}
		if (genderFilter.length > 0) {
			dataAfterFiltration = dataAfterFiltration.filter(item => genderFilter.find(itemGender => item.gender === itemGender))
		}
		if (priceFilter.length > 0) {
			dataAfterFiltration = dataAfterFiltration.filter(item => priceFilter.find(itemPrice => item.price >= itemPrice.split("-")[0] && item.price <= itemPrice.split("-")[1]))
		}

		// if no data is found show a error snackBar
		!dataAfterFiltration.length ? setErrorMessage(['Item not available', true]) : setErrorMessage(["", false]);

		setFilteredData(() => { return { ...filteredData, newData: [...dataAfterFiltration], filterOccurred: true } })

	}


	// search bar functionality
	const inputSearchBar = () => {
		// get the data, based on the input typed by the user inside searchBar 
		const { value } = document.getElementById("inputByUser");
		// window.scrollTo({ top: 270, left: 100, behavior: 'smooth' });

		value ? setFilters(() => { return { ...filters, name: [value] } }) : setFilters(() => { return { ...filters, name: [] } })
	}


	//removing all filters , a button is placed inside the filter section which can be used to clear all filters
	const removeAllFilters = () => {
		document.getElementById("inputByUser").value = "";

		const checkBoxInputs = document.getElementsByClassName("checkbox");
		const arrayOfCheckBoxInputs = Array.from(checkBoxInputs);
		arrayOfCheckBoxInputs.forEach(item => item.checked = false);

		setFilters(() => { return { ...filters, color: [], type: [], gender: [], price: [], name: [] } })
		setFilteredData(() => { return { ...filteredData, newData: [], filterOccurred: false } })
	}


	//handle "add to cart" button on products card. this adds the item to the cart
	const handleAdd = (id, quantity) => {
		let handleAddInCart = handleCartQuantity(id, quantity, cartItems, data)
		if (typeof handleAddInCart === 'string') {
			setErrorMessage([handleAddInCart, true])
			return;
		} else {
			setCartItems(handleAddInCart)
			return
		}
	}

	//removes single filter ... when a filter is checked it appers as a button in mobile view only. so if we click on this button created 
	// it removes that button and the filter as well
	// eg: if i checked "Red" in color filter , it will create a "Red" filter button, now when this button is clicked on it is removed from the 
	// view also that filter is removed
	const removeSingleFilters = (event, filterName) => {
		const value = event.target.innerText;
		const filterClicked = filters[filterName]
		const newFilter = filterClicked.filter(item => item !== value);
		setFilters(() => { return { ...filters, [filterName]: newFilter } })
		document.getElementById("inputByUser").value = "";

		const checkBoxInputs = document.getElementsByClassName(filterName);
		const arrayOfCheckBoxInputs = Array.from(checkBoxInputs);
		arrayOfCheckBoxInputs.map(item => item.value === value && (item.checked = false))
	}

	useEffect(() => {
		function totalCartItems() {
			let total = cartItems.reduce((acc, item) => acc + item.quantityByUser, 0)
			setTotalCartQuantity(total)
		}
		cartItems.length > 0 && totalCartItems()
	}, [cartItems])


	// closes snackbar
	const closeSnackBar = () => {
		setErrorMessage(["", false]);
	}


	return (
		<div>
			{errorMessage[1] === true ? (<Snackbar closeSnackBar={closeSnackBar} message={errorMessage} />) : ""}

			{/* // search-bar and button */}
			<div className="hero-container">
				<Header totalCartQuantity={totalCartQuantity} data={data} />
				<div className="product-search">
					
					<input
						type={"text"}
						placeholder="search"
						className="product-search-input"
						id="inputByUser"
						// onFocus={(event) => event.target.value = ""}
						onKeyUp={(event) => event.key === "Enter" ? inputSearchBar() : ""}
						defaultValue=""
					/>
					<button type="button" className="product-search-button" onClick={inputSearchBar}>
						<img
							src="search.svg"
							alt=""
							className="search-button-image"
						/>
					</button>
					<div style={{ color: "white", marginTop: "1rem" }} className="name-filter-desktop-view">
						search by name:{" "} {filters.name.map(item => <div style={{ display: "inline" }} className="filter-by-name" onClick={(event) => removeSingleFilters(event, "name")} key={Math.random()}>{item}</div>)}
					</div>
				</div>
			</div>

			<div className="product-container">
				{/*   // filter   */}
				<div className="product-filter-container">
					<div className="filter-container">
						<div className="remove-all-filter-button" onClick={removeAllFilters}><div>Press to Remove all Filters</div></div>
						<div className="color-filter">
							<div style={{ marginBottom: "5px" }}>Color</div>
							<div style={{ marginLeft: "10px" }} onChange={(event) => addFilters(event)}>
								<div>
									<input type={"checkBox"} name="color" id="Red" className="checkbox color" defaultValue="Red" />
									<label htmlFor="Red">{" "}Red{" "}</label>
								</div>
								<div>
									<input type={"checkBox"} name="color" id="Blue" className="checkbox color" defaultValue="Blue" />
									<label htmlFor="Blue">{" "}Blue{" "} </label>
								</div>
								<div>
									<input type={"checkBox"} name="color" id="Green" className="checkbox color" defaultValue="Green" />
									<label htmlFor="Green">{" "}Green</label>
								</div>
							</div>
						</div>
						<div className="gender-filter">
							<div style={{ marginBottom: "5px" }}>Gender</div>
							<div style={{ marginLeft: "10px" }} onChange={(event) => addFilters(event)} >
								<div>
									<input type={"checkBox"} name="gender" id="Men" className="checkbox gender" defaultValue="Men" />
									<label htmlFor="Men">{" "}Men</label>
								</div>
								<div>
									<input type={"checkBox"} name="gender" id="Women" className="checkbox gender" defaultValue="Women" />
									<label htmlFor="Women">{" "}Women</label>
								</div>
							</div>
						</div>
						<div className="price-filter">
							<div style={{ marginBottom: "5px" }}>Price</div>
							<div style={{ marginLeft: "10px" }} onChange={(event) => addFilters(event)} >
								{/* <div style={{width: "92%"}}>
                                    <input type={"button"} style={{width:"inherit"}} name="price" defaultValue="no ₹ filter" />
                                </div> */}
								<div>
									<input type={"checkbox"} name="price" id="0-250" className="checkbox price" defaultValue="0-250" />
									<label htmlFor="0-250">{" "}Rs.0-250</label>
								</div>
								<div>
									<input type={"checkbox"} name="price" id="251-450" className="checkbox price" defaultValue="251-450" />
									<label htmlFor="251-450">{" "}Rs.251-450</label>
								</div>
								<div>
									<input type={"checkbox"} name="price" id="450-1000" className="checkbox price" defaultValue="450-1000" />
									<label htmlFor="450-1000">{" "}Rs.450</label>
								</div>

							</div>
						</div>
						<div className="type-filter">
							<div style={{ marginBottom: "5px" }}>Type</div>
							<div style={{ marginLeft: "10px" }} onChange={(event) => addFilters(event)} >
								<div>
									<input type={"checkBox"} name="type" id="Polo" className="checkbox type" defaultValue="Polo" />
									<label htmlFor="Polo">{" "}Polo</label>
								</div>
								<div>
									<input type={"checkBox"} name="type" id="Hoodie" className="checkbox type" defaultValue="Hoodie" />
									<label htmlFor="Hoodie">{" "}Hoodie</label>
								</div>
								<div>
									<input type={"checkBox"} name="type" id="Basic" className="checkbox type" defaultValue="Basic" />
									<label htmlFor="Basic">{" "}Basic</label>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* // filters button that are visible in mobile view only */}
				<div className="mobile-view-filters">
					<div style={{ color: "white", marginTop: "0.25rem" }}>
						search by name:{" "} {filters.name.map(item => <div style={{ display: "inline" }} className="filter-by-name" onClick={(event) => removeSingleFilters(event, "name")} key={Math.random()}>{item}</div>)}
					</div>
					<div className="filters-button">
						{filters.type.map(item => <div className="filters-button-item" onClick={(event) => removeSingleFilters(event, "type")} key={Math.random()}>{item}</div>)}
						{filters.gender.map(item => <div className="filters-button-item" onClick={(event) => removeSingleFilters(event, "gender")} key={Math.random()}>{item}</div>)}
						{filters.price.map(item => <div className="filters-button-item" onClick={(event) => removeSingleFilters(event, "price")} key={Math.random()}>{item}</div>)}
						{filters.color.map(item => <div className="filters-button-item" onClick={(event) => removeSingleFilters(event, "color")} key={Math.random()}>{item}</div>)}
					</div>
				</div>

				{/* // product card displayed */}
				<div className="product-main">
					{
						loading === true && (
							<div
								style={{
									marginTop: "5rem",
									fontWeight: "1000",
									fontSize: "2rem",
									textAlign: "center",
								}}
							>
								Loading...
							</div>
						)}

					{
						filteredData.filterOccurred === false &&
						data.length > 0 &&
						data.map((item) => (
							<ProductCard
								productId={item.id}
								productImage={item.imageURL}
								productName={item.name}
								productPrice={item.price}
								productType={item.type}
								productGender={item.gender}
								productColor={item.color}
								productQuantity={item.quantity}
								handleAdd={handleAdd}
								key={item.id}
							/>
						))
					}
					{
						filteredData.filterOccurred === true &&
						filteredData.newData.map((item, index) =>
							<ProductCard
								productId={item.id}
								productImage={item.imageURL}
								productName={item.name}
								productPrice={item.price}
								productType={item.type}
								productGender={item.gender}
								productColor={item.color}
								productQuantity={item.quantity}
								handleAdd={handleAdd}
								key={item.id}
							/>
						)
					}
				</div>
			</div>
		</div>
	);
};

export default Product;
