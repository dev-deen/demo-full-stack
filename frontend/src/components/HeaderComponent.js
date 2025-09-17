import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import "../styles/headerstyle.css";
import { useNavigate } from "react-router-dom";
import AddProductComponent from "./AddProductComponent"
import DemandForecastChart from "./DemandForecastChart";

export default function HeaderComponent({
  isProductPage,
  products,
  setProducts,
  demandForecast,
  setDemandForecast,
  setModalContent,
  setComponentProps,
  productsForDemandChart
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  const navigate = useNavigate();

  const fetchProduct = async () => {
    try {
      const response = await api.get("products", {
        params: { search: searchKeyword, category: categoryFilter },
      });
      const transformed = response.data.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        costPrice: parseFloat(p.cost_price),
        sellingPrice: parseFloat(p.selling_price),
        description: p.description,
        availableStocks: p.stock_available,
        unitsSold: p.units_sold,
      }));
      setProducts(transformed);
    } catch {
      setError("Something went wrong while searching");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const fetchCategory = async () => {
    try {
      const res = await api.get("products/get_all_categories");
      setCategoryOptions(res.data.categories);
    } catch (err) {
      console.error(err);
      setError("Category fetch error");
    }
  };

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchProduct(), 500);
  };

  const handleCategoryFilter = (e) => setCategoryFilter(e.target.value);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProduct();
  };

  const handleAddProduct = () => {
    setModalContent(<AddProductComponent/>);
  }

  const getDemandForecastData = async () => {
    const selected = products.filter((p) =>
      productsForDemandChart.includes(p.id)
    );
    console.log("selected: ", selected)
    return Promise.all(
      selected.map(async (product) => {
        try {
          const res = await api.get(`products/${product.id}/get_forecast`);
          console.log("res: ", res.data);
          return { ...product, data: res.data.demand_forecast };
        } catch (err) {
          console.error(err);
          return { ...product, data: [] };
        }
      })
    );
  };

  const handleDemandForecast = async () => {
    console.log(productsForDemandChart)
    if(!productsForDemandChart || productsForDemandChart.length===0){
      alert("Please select some product for demand chart")
      return;
    }
    const chartData = await getDemandForecastData();
    console.log("charDat:", chartData);
    setComponentProps({ data: chartData });
    setModalContent(DemandForecastChart);
  };

  useEffect(() => {
    fetchCategory();
  }, []);


  return (
    <div className="header-container">
      <div className="header-left">
        <div className="header-back" onClick={handleBack}>Back</div>
        <div className="header-title">
          {isProductPage ? "Create and Manage Product" : "Price Optimization"}
        </div>
        {isProductPage && (
          <div className="header-switch">
            <input
              type="checkbox"
              name="demandSwitch"
              checked={demandForecast}
              onChange={() => setDemandForecast((prev) => !prev)}
            />
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
            {categoryOptions.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button type="submit" className="header-filter">Filter</button>
        </form>

        <div className="header-actions">
          <button onClick={handleAddProduct}>Add Product</button>
          <button onClick={handleDemandForecast}>Demand Forecast</button>
        </div>
      </div>
    </div>
  );
}
