import React, { useState, useEffect } from "react";
import "../styles/Table.css";
import api from "../api/axios";

export default function Table({
  tableData,
  demandForecast,
  productsForDemandChart,
  setProductsForDemandChart,
}) {
  const [demandForecastData, setDemandForecastData] = useState({});

  const handleToggle = (id = null) => {
    if (!id) {
      // select all / deselect all
      if (productsForDemandChart.length === tableData.length)
        setProductsForDemandChart([]);
      else setProductsForDemandChart(tableData.map((p) => p.id));
      return;
    }

    if (!productsForDemandChart.includes(id)) {
      setProductsForDemandChart([...productsForDemandChart, id]);
    } else {
      setProductsForDemandChart(
        productsForDemandChart.filter((p) => p !== id)
      );
    }
  };

  const fetchDemand = async () => {
    if (
      demandForecast &&
      Object.keys(demandForecastData).length !== tableData.length
    ) {
      const forecast = await Promise.all(
        tableData.map(async (row) => {
          try {
            const res = await api.get(`products/${row.id}/get_forecast`);
            const list = res.data.demand_forecast;
            const avg =
              list.reduce((acc, o) => acc + parseFloat(o.demand), 0) /
              list.length;
            return [row.id, avg.toFixed(2)];
          } catch (err) {
            console.error(err);
            return [row.id, "-"];
          }
        })
      );
      setDemandForecastData(Object.fromEntries(forecast));
    }
  };

  useEffect(() => {
    fetchDemand();
  }, [demandForecast, tableData]);

  if (!tableData || tableData.length === 0)
    return <p style={{ textAlign: "center" }}>No data to display</p>;

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {Object.keys(tableData[0]).map((key) => (
              <th key={key}>
                {key === "id" ? (
                  <input
                    type="checkbox"
                    checked={productsForDemandChart.length === tableData.length}
                    onChange={() => handleToggle()}
                  />
                ) : (
                  key
                )}
              </th>
            ))}
            {demandForecast && <th>Demand Forecast</th>}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row.id}>
              {Object.keys(row).map((key) => (
                <td key={key}>
                  {key === "id" ? (
                    <input
                      type="checkbox"
                      checked={productsForDemandChart.includes(row.id)}
                      onChange={() => handleToggle(row.id)}
                    />
                  ) : (
                    row[key]
                  )}
                </td>
              ))}
              {demandForecast && (
                <td>{demandForecastData[row.id] ?? "Loading..."}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
