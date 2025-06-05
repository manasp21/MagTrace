import logging
import time
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class RequestResponseLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()
        logger.info(f"Request: {request.method} {request.path}")

    def process_response(self, request, response):
        duration = time.time() - request.start_time
        logger.info(f"Response: {request.method} {request.path} | Status: {response.status_code} | Duration: {duration:.2f}s")
        return response

    def process_exception(self, request, exception):
        logger.error(f"Exception: {request.method} {request.path} | Error: {str(exception)}", exc_info=True)