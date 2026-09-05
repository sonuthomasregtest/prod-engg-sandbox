import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric to track connection errors (simulating TLS handshake / pool starvation)
const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    retry_storm_simulation: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 1000,
      stages: [
        { target: 200, duration: '30s' }, // Ramp-up to peak load
        { target: 500, duration: '1m' },  // Induce stress to trigger backoff
        { target: 50, duration: '30s' },  // Ramp-down
      ],
    },
  },
  thresholds: {
    // We expect the backoff to handle the load gracefully without high failure rates
    'errors': ['rate<0.05'], 
    'http_req_duration': ['p(95)<2000'], // 95% of requests must complete below 2s
  },
};

const BASE_URL = __ENV.TARGET_ENV_URL || 'http://localhost:8080';

export default function () {
  // Simulate the settlement service sync trigger
  const res = http.post(`${BASE_URL}/api/v1/sync/eu_payment_gateway`, JSON.stringify({
    timestamp: new Date().toISOString(),
    batch_size: 100
  }), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '5s'
  });

  const success = check(res, {
    'is status 200 or 202 (Accepted)': (r) => r.status === 200 || r.status === 202,
    'is not 503 (No Pool Starvation)': (r) => r.status !== 503,
  });

  errorRate.add(!success);
  
  // Sleep to simulate client pacing, relying on the backend to handle the jitter/retries
  sleep(Math.random() * 2 + 1); 
}
