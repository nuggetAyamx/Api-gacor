const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const archiver = require('archiver');
const { execSync } = require('child_process')
const { spawn } = require('child_process')

const app = express();
const PORT = process.env.PORT || 5300;
// ── CLOUDFLARE TUNNEL ─────────────────────────
if (process.env.CF_TUNNEL_ENABLED === 'true' && process.env.CF_TUNNEL_TOKEN) {
  try {
    execSync('wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /home/container/cloudflared && chmod +x /home/container/cloudflared');
    spawn('/home/container/cloudflared', ['tunnel', '--no-autoupdate', 'run', '--token', process.env.CF_TUNNEL_TOKEN], { stdio: 'inherit', detached: true });
    console.log('[CF Tunnel] Tunnel started!');
  } catch (e) {
    console.error('[CF Tunnel] Failed:', e.message);
  }
}

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', express.static(path.join(__dirname, 'api-page')));
app.use('/src', express.static(path.join(__dirname, 'src')));

const settingsPath = path.join(__dirname, './src/settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

app.use((req, res, next) => {
  const start = Date.now();
  const oldSend = res.send;
  const oldJson = res.json;

  let responseBody = '';

  res.send = function (body) {
    responseBody = body;
    return oldSend.call(this, body);
  };

  res.json = function (data) {
    const finalData = {
      status: data?.status,
      creator: settings.apiSettings.creator || "Created Using Rynn UI",
      ...data
    };
    responseBody = JSON.stringify(finalData);
    return oldJson.call(this, finalData);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket.remoteAddress ||
      'Unknown';

    const logConsole = `${new Date().toISOString()} | ${ip} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms`;

    if (res.statusCode < 400) console.log(chalk.green(`✅ ${logConsole}`));
    else if (res.statusCode < 500) console.log(chalk.yellow(`⚠️ ${logConsole}`));
    else console.log(chalk.red(`❌ ${logConsole}`));
  });

  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
    return next();
  }
  
  if (req.path === '/' || req.path === '') {
    return next();
  }
  
  const requestedPath = req.path.replace(/^\//, '');
  const htmlFile = path.join(__dirname, 'api-page', `${requestedPath}.html`);
  
  if (fs.existsSync(htmlFile)) {
    return res.sendFile(htmlFile);
  }
  
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', 'index.html'));
});

app.get('/docu', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', 'docu.html'));
});

app.get('/404', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', '404.html'));
});

app.get('/500', (req, res) => {
  res.sendFile(path.join(__dirname, 'api-page', '500.html'));
});

let totalRoutes = 0;
const apiFolder = path.join(__dirname, './src/api');

fs.readdirSync(apiFolder).forEach(folder => {
  const folderPath = path.join(apiFolder, folder);
  if (fs.statSync(folderPath).isDirectory()) {
    fs.readdirSync(folderPath).forEach(file => {
      if (file.endsWith('.js')) {
        require(path.join(folderPath, file))(app);
        totalRoutes++;
        console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` 🚀 Loaded Route: ${file} `));
      }
    });
  }
});

console.log(chalk.bgHex('#90EE90').hex('#333').bold(' ✅ Load Complete! '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` 📊 Total Routes Loaded: ${totalRoutes} `));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'api-page', '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'api-page', '500.html'));
});

app.listen(PORT, () => {
  console.log(chalk.bgHex('#90EE90').hex('#333').bold(` 🚀 Server running on port ${PORT} `));
});

module.exports = app;
