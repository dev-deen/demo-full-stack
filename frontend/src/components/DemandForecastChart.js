import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

/**
 * props.data = [
 *   { id, name, data: [ {price, demand}, ...] },
 *   ...
 * ]
 */
export default function DemandForecastChart({ data }) {

  const chartData = {
    labels: data[0]?.data.map((d) => d.price) || [],
    datasets: data.map((prod) => ({
      label: prod.name,
      data: prod.data.map((d) => d.demand),
      borderColor: `hsl(${Math.random() * 360},70%,50%)`,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Demand Forecast (Price vs Demand)" },
    },
    scales: {
      x: { title: { display: true, text: "Price" } },
      y: { title: { display: true, text: "Demand" } },
    },
  };

  return (
    <div style={{ width: "90%", margin: "0 auto" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
