# services/billing.py

import logging

LOGGER = logging.getLogger(__name__)

def calculate_telemetry_metrics(batch_connection_count: int, denominator: int) -> float:
    """
    Calculate telemetry metrics for batch connections.
    Prevents ZeroDivisionError by defaulting zero denominator to 1.
    """
    if denominator == 0:
        LOGGER.warning("Simulated telemetry exception: batch connection denominator zero")
        denominator = 1
    return batch_connection_count / denominator
