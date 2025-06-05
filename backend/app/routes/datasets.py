import os
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd

@api_view(['GET'])
def load_example_data(request):
    try:
        # Construct path to example data
        example_path = os.path.join(settings.BASE_DIR, '..', 'example', 'data_1.csv')
        
        # Read and process data
        df = pd.read_csv(example_path)
        processed_data = df.to_dict(orient='records')
        
        return Response({"data": processed_data})
    except Exception as e:
        return Response({"error": str(e)}, status=500)