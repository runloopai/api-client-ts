import tls from 'node:tls';

const BASE_URL = process.env.RUNLOOP_BASE_URL ?? 'https://api.runloop.pro';
const url = new URL(BASE_URL);

console.log(`Checking ALPN for ${url.hostname}:${url.port || 443}`);

const socket = tls.connect(
  {
    host: url.hostname,
    port: parseInt(url.port || '443', 10),
    ALPNProtocols: ['h2', 'http/1.1'],
    servername: url.hostname,
  },
  () => {
    console.log(`Negotiated protocol: ${socket.alpnProtocol}`);
    console.log(`TLS version: ${socket.getProtocol()}`);
    socket.end();
  },
);

socket.on('error', (err) => {
  console.error('TLS error:', err.message);
});
