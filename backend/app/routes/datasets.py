import os
import math
import csv
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd

def parse_csv(csv_text):
    lines = csv_text.strip().split('\n')
    if len(lines) < 2:
        return []
    
    reader = csv.reader(lines)
    headers = [h.strip().lower() for h in next(reader)]
    dataset = []
    
    # Column mapping with common variations
    column_map = {
        'timestamp': ['time', 'timestamp', 't'],
        'bx': ['bx', 'x', 'x-component', 'b_x'],
        'by': ['by', 'y', 'y-component', 'b_y'],
        'bz': ['bz', 'z', 'z-component', 'b_z'],
        'magnitude': ['magnitude', '|b|', 'b_total', 'total']
    }
    
    # Find column indices
    col_indices = {}
    for key, aliases in column_map.items():
        for alias in aliases:
            if alias in headers:
                col_indices[key] = headers.index(alias)
                break
    
    # Parse data
    for row in reader:
        if len(row) < len(headers):
            continue
            
        entry = {}
        
        # Map known columns
        for col, idx in col_indices.items():
            if idx < len(row):
                try:
                    entry[col] = float(row[idx])
                except ValueError:
                    entry[col] = row[idx].strip()
        
        # Calculate magnitude if missing
        if 'magnitude' not in entry and all(k in entry for k in ['bx', 'by', 'bz']):
            entry['magnitude'] = math.sqrt(entry['bx']**2 + entry['by']**2 + entry['bz']**2)
        
        dataset.append(entry)
    
    return dataset

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

@api_view(['POST'])
def create_dataset(request):
    try:
        file = request.FILES.get('file')
        if not file or not file.name.endswith('.csv'):
            return Response({"error": "Invalid file format. Please upload a CSV file"}, status=400)
        
        csv_text = file.read().decode('utf-8')
        data = parse_csv(csv_text)
        
        if not data:
            return Response({"error": "No valid data found in CSV file"}, status=400)
            
        return Response(data)
    except Exception as e:
        return Response({"error": f"Processing failed: {str(e)}"}, status=500)