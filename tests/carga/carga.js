
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99']
  }
};

export default function () {
  const resposta = http.get('http://127.0.0.1:3000/api/products');

  check(resposta, {
    'HTTP 200': (r) => r.status === 200,
    'Lista de produtos valida': (r) => {
      try {
        const produtos = r.json();
        return Array.isArray(produtos) && produtos.length > 0;
      } catch {
        return false;
      }
    }
  });

  sleep(1);
}
