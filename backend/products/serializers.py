from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):

    optimized_price = serializers.DecimalField(max_digits=9, decimal_places=2, read_only=True)
    demand_forecast = serializers.JSONField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'