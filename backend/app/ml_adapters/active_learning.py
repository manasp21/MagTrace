import numpy as np
from sklearn.cluster import KMeans

def get_proposals(data):
    # Extract features
    features = np.array([[d['b_x'], d['b_y'], d['b_z']] for d in data])
    
    # Cluster data to find patterns
    kmeans = KMeans(n_clusters=3).fit(features)
    clusters = kmeans.labels_
    
    # Generate proposals based on clusters
    proposals = []
    for i in range(3):
        cluster_points = [data[j] for j in np.where(clusters == i)[0]]
        start = min(d['timestamp'] for d in cluster_points)
        end = max(d['timestamp'] for d in cluster_points)
        proposals.append({
            'start': start,
            'end': end,
            'label': f'Cluster {i+1} Event',
            'confidence': 0.85
        })
    
    return proposals