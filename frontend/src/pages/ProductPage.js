import Table from '../components/Table';
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import HeaderComponent from '../components/HeaderComponent';
import Modal from '../components/Modal';

export default function ProductPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [demandForecast, setDemandForecast] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [componentProps, setComponentProps] = useState({});
    const [productsForDemandChart, setProductsForDemandChart] = useState([])

    
    const fetchProduct = async () =>{
        setLoading(true);
        setError("");
        try{
            const response = await api.get('/products/');
            const transformedProducts = response.data.map(product => ({
                id: product.id,
                name: product.name,
                category: product.category,
                costPrice: parseFloat(product.cost_price),
                sellingPrice: parseFloat(product.selling_price),
                description: product.description,
                availableStocks: product.stock_available,
                unitsSold: product.units_sold
            }))
            setData(transformedProducts);
        }catch(error){
            setData([]);
            setError(error);
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchProduct();
    }, [])


    const handleModalClose = () =>{
        setIsModalOpen(false);
        setModalContent(null);
        setModalProps(null);
        setComponentProps(null);
    }

    useEffect(()=>{
        if(modalContent){
            setIsModalOpen(true);
        }
    },[modalContent])
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

            <Table 
            tableData={data}
            demandForecast={demandForecast}
            setModalContent={setModalContent}
            setComponentProps={setComponentProps}
            productsForDemandChart={productsForDemandChart}
            setProductsForDemandChart={setProductsForDemandChart}
            />

            <Modal 
            isOpen={isModalOpen}
            onClose={handleModalClose}
            Component={modalContent}
            componentProps={componentProps}/>

        </div>
    )
}