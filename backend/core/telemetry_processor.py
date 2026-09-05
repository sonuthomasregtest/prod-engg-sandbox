"""Telemetry Processor for Batch Connections."""

import logging
from typing import Dict, Any

LOGGER = logging.getLogger(__name__)

def calculate_batch_connection_rate(active_connections: int, batch_count: int) -> float:
    """Calculate the average active connections per batch.
    
    Prevents ZeroDivisionError when batch_count (denominator) is zero.
    """
    if batch_count == 0:
        LOGGER.warning("Batch count is zero. Connection rate calculation skipped to prevent ZeroDivisionError.")
        return 0.0
        
    return float(active_connections) / float(batch_count)
