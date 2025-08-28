from django.db import models

# Create your models here.
class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=500)
    cost_price = models.DecimalField(max_digits=9, decimal_places=2)
    selling_price = models.DecimalField(max_digits=9, decimal_places=2)
    category = models.CharField(max_length=255, blank=False, null=False)
    stock_available = models.IntegerField(default=0)
    units_sold = models.IntegerField(default=0)
    customer_rating = models.DecimalField(max_digits=3, decimal_places=2)
    demand_forecast = models.JSONField()
    optimized_price = models.DecimalField(max_digits=9, decimal_places=2)

    def __str__(self):
        return f"{self.name} - {self.category}"