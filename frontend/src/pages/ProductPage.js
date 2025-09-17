import Table from '../components/Table';
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import HeaderComponent from '../components/HeaderComponent';
import Modal from '../components/Modal';

export default function ProductPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demandForecast, setDemandForecast] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [componentProps, setComponentProps] = useState({});
  const [productsForDemandChart, setProductsForDemandChart] = useState([]);

  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get('/products/');
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
      setData(transformed);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setComponentProps({});
  };

  useEffect(() => {
    if (modalContent) setIsModalOpen(true);
  }, [modalContent]);

  return (
    <div>
      <HeaderComponent
        isProductPage={true}
        products={data}
        setProducts={setData}
        demandForecast={demandForecast}
        setDemandForecast={setDemandForecast}
        setModalContent={setModalContent}
        setComponentProps={setComponentProps}
        productsForDemandChart={productsForDemandChart}
      />

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <Table
        tableData={data}
        demandForecast={demandForecast}
        setProductsForDemandChart={setProductsForDemandChart}
        productsForDemandChart={productsForDemandChart}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        Component={modalContent}
        componentProps={componentProps}
      />
    </div>
  );
}
