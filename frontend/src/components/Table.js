import React, { useState, useEffect } from "react";
import "../styles/Table.css"; // import CSS
import api from "../api/axios";

export default function Table({ 
    tableData, 
    demandForecast,
    productsForDemandChart,
    setProductsForDemandChart
    }) {

    const [demandForecastData, setDemandForecastData] = useState({});


    const handleProductToggleForDemandChart = (id=null)=>{

        //For select all and deselect all
        if(!id){
            if(productsForDemandChart.length === tableData.length){
                setProductsForDemandChart([]);
            }else{
                setProductsForDemandChart(tableData.map((product)=>product.id))
            }
            return;
        }

        //for selecting individual element
        if(!productsForDemandChart.includes(id)){
            setProductsForDemandChart([...productsForDemandChart, id])
        }else{
            setProductsForDemandChart(
                productsForDemandChart.filter((p_id)=>p_id !== id))
        }
    }

    //function to fetch demand forecast
    const fetchDemand = async()=>{
        if(demandForecast && Object.keys(demandForecastData).length != tableData.length){
            const forecast = await Promise.all(tableData.map(async(data)=>{
                try{
                    const response = await api.get(`products/${data.id}/get_forecast`);
                    const demandForecastList = response.data.demand_forecast;
                    const sum = demandForecastList.reduce((acc, obj)=>(
                        acc+parseFloat(obj.demand)  
                    ), 0)
                    console.log(sum)
                    const average = sum / demandForecastList.length;
                    return [data.id, average.toFixed(2)];
                }catch(error){
                    console.log(error);
                    return [data.id, "-"];
                }
            }))
            setDemandForecastData(Object.fromEntries(forecast));
        }
    }


    useEffect(()=>{
        
        fetchDemand();
        
    }, [demandForecast, tableData])

  return (
    <div class="table-container">
      {!tableData || tableData.length === 0 ? (
        <p>No data to display</p>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              {Object.keys(tableData[0]).map((key) => (
                <th key={key}>{key === 'id' ? 
                    <input
                        type="checkbox"
                        checked={productsForDemandChart.length === tableData.length}
                        onChange={()=>{handleProductToggleForDemandChart()}}
                    ></input>
                    : key
                }</th>
              ))}
              {demandForecast && 
                <th>Demand Forecast</th>}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                {Object.keys(row).map((key, i) => (
                  <td key={i}>{key === 'id'?
                    <input
                        type="checkbox"
                        checked={productsForDemandChart.includes(row.id)}
                        onChange={()=>{handleProductToggleForDemandChart(row.id)}}
                    ></input>
                    :row[key]
                    }</td>
                ))}
                {demandForecast &&
                <td>
                    {demandForecastData[row.id] ?? "Loading..."}
                </td>
                }
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
