from django.shortcuts import render
from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
import numpy as np

# Create your views here.
class ProductViewSet(viewsets.ModelViewSet):



    BASE_DEMAND = 500

    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    
    def list(self, request):

        queryset = Product.objects.all()

        #Add search logic
        if 'search' in request.query_params and request.query_params['search']:
            search = request.query_params['search']
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__icontains=search)
            )
        if 'category' in request.query_params and request.query_params['category']:
            category = request.query_params['category']
            queryset = queryset.filter(category=category)

        if 'min_price' in request.query_params:
            min_price = request.query_params['min_price']
            queryset = queryset.filter(selling_price__gte=min_price)

        if 'max_price' in request.query_params:
            max_price = request.query_params['max_price']
            queryset = queryset.filter(selling_price__lte=max_price)

        if 'min_rating' in request.query_params:
            min_rating = request.query_params['min_rating']
            queryset = queryset.filter(customer_rating__gte=min_rating)

        if 'sort_by' in request.query_params:
            sort_by = request.query_params['sort_by']
            if sort_by in ['selling_price','-selling_price', 'customer_rating', '-customer_rating', 'units_sold', '-units_sold']:
                queryset = queryset.order_by(sort_by)
        
        serializer = ProductSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    def create(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def get_all_categories(self, request):
        try:
            categories = Product.objects.values_list('category', flat=True).distinct()
        except Exception as e:
            return Response({"error": f"Something went wrong - {e}"})
        return Response({"categories": categories}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def get_forecast(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Demand forecast not available. Please generate forecast first."}, status=status.HTTP_400_BAD_REQUEST)
        if not product.demand_forecast:

            # Simple forecast logic: demand decreases as price increases
            base_demand = self.BASE_DEMAND
            prices = np.linspace(product.cost_price, product.selling_price*2, 10)
            demand = [max(0, base_demand - (p - product.selling_price)*2) for p in prices]
            demand_forecast = [{"price": round(float(p),2), "demand": round(float(d),2)} for p, d in zip(prices, demand)]
            product.demand_forecast = demand_forecast
            product.save()
        return Response({"demand_forecast": product.demand_forecast})

    @action(detail=True, methods=['get'])
    def get_optimized_price(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        if not product.demand_forecast:
            return Response({"error": "Demand forecast not available. Please generate forecast first."}, status=status.HTTP_400_BAD_REQUEST)
        demand_forecast = product.demand_forecast
        price_x_demand_values = [round(item['price']*item['demand'],2) for item in demand_forecast]
        best_result = max(price_x_demand_values)
        index_of_best_price = price_x_demand_values.index(best_result)
        best_price = demand_forecast[index_of_best_price]['price']
        product.optimized_price = round(float(best_price),2)
        product.save()
        return Response({"optimized_price": product.optimized_price})