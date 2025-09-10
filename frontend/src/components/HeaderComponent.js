import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import "../styles/headerstyle.css"; 
import {useNavigate} from 'react-router-dom';
import AddProductComponent from './AddProductComponent';
import DemandForecastChart from "./DemandForecastChart";

export default function HeaderComponent(
    {
     isProductPage, 
     products,
     setProducts,
     demandForecast,
     setDemandForecast,
     setModalContent,
     setComponentProps,
     productsDataForDemandChart 
    }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);


  const navigate = useNavigate();

  // product api request
  const fetchProduct = async () => {
    try {
      const response = await api.get("products", {
        params: {
          search: searchKeyword,
          category: categoryFilter,
        },
      });

      const transformedProducts = response.data.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        costPrice: parseFloat(product.cost_price),
        sellingPrice: parseFloat(product.selling_price),
        description: product.description,
        availableStocks: product.stock_available,
        unitsSold: product.units_sold,
      }));

      setProducts(transformedProducts);
    } catch (error) {
      setError("Something went wrong while Searching");
    }
  };

  //handle back
  const handleBack = () =>{
    if(window.history.length > 1){
        navigate(-1);
    }else{
        navigate("/")
    }
  }

  // category api request
  const fetchCategory = async () => {
    try {
      const response = await api.get("products/get_all_categories");
      setCategoryOptions(response.data.categories);
    } catch (error) {
      console.log(error);
      setError("Categories fetch Error");
    }
  };

  // search function with debouncing
  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProduct();
    }, 500);
  };

  // category filter
  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
  };

  // filter submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProduct();
  };

  // add product page assigned to Modal
  const handleAddProduct = () => {
    setModalContent(AddProductComponent);
  };

  const getDemandForecastData = () =>{
    const selectedProducts = products.filter((product)=>productsDataForDemandChart.includes(product.id))
    const chartData = Promise.all(selectedProducts.map(async(product)=>{
      try{
        const response = await api.get(`products/${product.id}/get_forecast`);
        return {
          ...product,
          data: response.data.demand_forecast
        }
      }catch(error){
        console.log("headerComponent: " + error);
        return {
          product, 
          data: []
        }
      }
    }));
    return chartData;
  }

  //filtered data passed to chart which will be presented in modal
  const handleDemandForecast = () => {
    setModalContent(DemandForecastChart);
    const chartData = Promise.all(selectedProducts.map(async(product)=>{
      try{
        const response = await api.get(`products/${product.id}/get_forecast`);
        return {
          ...product,
          data: response.data.demand_forecast
        }
      }catch(error){
        console.log("headerComponent: " + error);
        return {
          product, 
          data: []
        }
      }
    }));
    
    setComponentProps({
      
    })
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  return (
    <div className="header-container">

        <div className="header-left">
            <div className="header-back"
            onClick={handleBack}
            >Back
            </div>
            <div className="header-title">
            {isProductPage ? "Create and Manage Product" : "Prize Optimization"}
            </div>
            {isProductPage && (
            <div className="header-switch">
                <input 
                type="checkbox" 
                name="demandSwitch" 
                checked={demandForecast}
                onChange={()=>setDemandForecast((prev)=>!prev)}/>
                <label htmlFor="demandSwitch">With Demand Forecast</label>
            </div>
            )}
        </div>


        <div className="header-right">
            <div className="header-search">
            <input
                type="search"
                placeholder="Search"
                value={searchKeyword}
                onChange={handleSearch}
            />
            </div>

            <form className="header-search" onSubmit={handleFilterSubmit}>
            <label className="header-label">Category: </label>
            <select
                className="header-category"
                value={categoryFilter}
                onChange={handleCategoryFilter}
            >
                <option value="">All</option>
                {categoryOptions?.map((cat, i) => (
                <option key={i} value={cat}>
                    {cat}
                </option>
                ))}
            </select>

            <button type="submit" className="header-filter">
                Filter
            </button>
            </form>

            <div className="header-actions">
            <button onClick={handleAddProduct}>Add Product</button>
            <button onClick={handleDemandForecast}>Demand Forecast</button>
            </div>
        </div>
      </div>

  );
}
