// annotationRenderer.js - Renders annotations on chart
import { LabelManager } from './labelManager.js';
import AnnotationManager from './annotationManager.js';

class AnnotationRenderer {
    constructor(chartContainer, xScale) {
        this.container = chartContainer;
        this.xScale = xScale;
        this.annotationLayer = null;
        this.createAnnotationLayer();
    }

    createAnnotationLayer() {
        // Remove existing layer if present
        d3.select(this.container).select('.annotation-layer').remove();
        
        // Create new annotation layer
        this.annotationLayer = d3.select(this.container)
            .append('g')
            .attr('class', 'annotation-layer')
            .attr('pointer-events', 'none');
    }

    updateScale(xScale) {
        this.xScale = xScale;
    }

    renderAnnotations(visibleRange) {
        if (!this.annotationLayer) return;
        
        // Clear existing annotations
        this.annotationLayer.selectAll('.annotation').remove();
        
        // Get annotations in current visible range
        const annotations = AnnotationManager.getAnnotationsInRange(
            visibleRange.start, 
            visibleRange.end
        );
        
        // Render each annotation
        annotations.forEach(anno => {
            const label = LabelManager.getAllLabels().find(l => l.id === anno.labelId);
            if (!label) return;
            
            const xStart = this.xScale(anno.startTime);
            const xEnd = this.xScale(anno.endTime);
            const width = Math.max(2, xEnd - xStart);
            
            this.annotationLayer.append('rect')
                .attr('class', 'annotation')
                .attr('x', xStart)
                .attr('y', 0)
                .attr('width', width)
                .attr('height', '100%')
                .attr('fill', label.color)
                .attr('fill-opacity', 0.3)
                .attr('stroke', label.color)
                .attr('stroke-width', 1);
        });
    }

    highlightAnnotation(annotationId) {
        this.annotationLayer.selectAll('.annotation')
            .attr('stroke-width', d => d.id === annotationId ? 3 : 1);
    }
}

export default AnnotationRenderer;