#!/usr/bin/env node
const http = require('http');
const { URL } = require('url');
const net = require('net');
const querystring = require('querystring');
const fetch = global.fetch || require('node-fetch');
const config = require('./config.cjs');

const PORT = process.env.PORT || 3001;

function sendTcpPayload(hex) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const buffer = Buffer.from(hex, 'hex');
    client.connect(config.TCP_PORT, config.HOST_TCP, () => {
      client.write(buffer);
      client.end();
    });

    client.on('close', () => resolve(true));
    client.on('error', (err) => reject(err));
  });
}

async function postForm(url, bodyObj) {
  const body = querystring.stringify(bodyObj);
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await resp.text();
  try { return JSON.parse(text); } catch (e) { return { raw: text }; }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // add CORS headers for browser requests
  const setCors = () => {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOW_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  };
  setCors();

  // respond to preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/trigger-gate') {
    try {
      await sendTcpPayload(config.PAYLOAD_GATE_ON);
      await new Promise(r => setTimeout(r, 300));
      await sendTcpPayload(config.PAYLOAD_GATE_OFF);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/toggle-lights') {
    try {
      // Get device mac first
      const now = new Date().toISOString().replace('T', ' ').split('.')[0];
      const authBody = {
        security_code: config.SECURITY_CODE,
        account: config.ACCOUNT,
        devicetoken: config.DEVICETOKEN,
        current_date: now,
        master_account: config.MASTER_ACCOUNT,
      };
      const authResp = await postForm(`${config.HOST_HTTP}/yetcloud_release/get_all_device_data.php`, authBody);
      const deviceData = authResp.message && authResp.message[0];
      const device_mac = deviceData ? deviceData.mac : null;

      if (!device_mac) throw new Error('device_mac not found');

      const statusBody = { security_code: config.SECURITY_CODE, account: config.ACCOUNT, mac: device_mac, current_date: now };
      const statusResp = await postForm('http://www.yaoertaicloud-de.com/yetcloud_release/get_device_data.php', statusBody);
      const status = statusResp.message && statusResp.message[0];
      const lights = status ? status.status2 : null;

      if (lights === '1') {
        await sendTcpPayload(config.PAYLOAD_LIGHTS_OFF);
      } else {
        await sendTcpPayload(config.PAYLOAD_LIGHTS_ON);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, before: lights }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/device-status') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const parsed = querystring.parse(body);
        const now = new Date().toISOString().replace('T', ' ').split('.')[0];
        const reqBody = { security_code: config.SECURITY_CODE, account: config.ACCOUNT, mac: parsed.mac, current_date: now };
        const statusResp = await postForm('http://www.yaoertaicloud-de.com/yetcloud_release/get_device_data.php', reqBody);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(statusResp));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/auth') {
    try {
      const now = new Date().toISOString().replace('T', ' ').split('.')[0];
      const authBody = {
        security_code: config.SECURITY_CODE,
        account: config.ACCOUNT,
        devicetoken: config.DEVICETOKEN,
        current_date: now,
        master_account: config.MASTER_ACCOUNT,
      };
      const authResp = await postForm(`${config.HOST_HTTP}/yetcloud_release/get_all_device_data.php`, authBody);
      const deviceData = authResp.message && authResp.message[0];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, device: deviceData }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // gate status proxy to facial watcher
  if (req.method === 'GET' && url.pathname === '/api/gate-status') {
    try {
      const resp = await fetch('http://127.0.0.1:5001/status');
      const json = await resp.json();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(json));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // simple health
  if (req.method === 'GET' && url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`device-proxy listening on ${PORT}`);
});
