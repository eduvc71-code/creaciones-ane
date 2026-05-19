const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8'
};

const ALLOWED_PATH = /^(index\.html|fotos_mpg\/[a-z0-9._-]+\.(jpg|jpeg|png|webp|mp4|mov|webm)|assets\/[a-z0-9._/-]+\.(jpg|jpeg|png|webp|mp4|mov|webm))$/i;

function json(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...corsHeaders }
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || '*';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function requireEnv(env, name) {
  const value = env[name];
  if (!value) throw new Error(`Falta configurar ${name}.`);
  return value;
}

function safeGitHubPath(path) {
  const normalized = String(path || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!ALLOWED_PATH.test(normalized) || normalized.includes('..')) {
    throw new Error(`Ruta no permitida: ${path}`);
  }
  return normalized;
}

function encodePath(path) {
  return path.split('/').map(part => encodeURIComponent(part)).join('/');
}

function assertBase64(contentBase64) {
  const content = String(contentBase64 || '');
  if (!content || content.length > 14 * 1024 * 1024) {
    throw new Error('Archivo vacío o demasiado grande para este canal.');
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(content)) {
    throw new Error('Contenido base64 inválido.');
  }
  return content;
}

async function githubRequest(env, path, init = {}) {
  const owner = requireEnv(env, 'GITHUB_OWNER');
  const repo = requireEnv(env, 'GITHUB_REPO');
  const token = requireEnv(env, 'GITHUB_TOKEN');
  const url = `https://api.github.com/repos/${owner}/${repo}/${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'creaciones-ane-admin-channel',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok && response.status !== 404) {
    throw new Error(data.message || `GitHub respondió ${response.status}.`);
  }
  return { response, data };
}

async function getExistingSha(env, path, branch) {
  const encoded = encodePath(path);
  const { response, data } = await githubRequest(env, `contents/${encoded}?ref=${encodeURIComponent(branch)}`);
  return response.status === 404 ? undefined : data.sha;
}

async function putFile(env, file, message, branch) {
  const path = safeGitHubPath(file.path);
  const content = assertBase64(file.contentBase64);
  const sha = await getExistingSha(env, path, branch);
  const body = {
    message,
    content,
    branch,
    ...(sha ? { sha } : {})
  };
  const encoded = encodePath(path);
  const { data } = await githubRequest(env, `contents/${encoded}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  return {
    path,
    commit: data.commit?.sha || null
  };
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/api/publish') {
      return json({ error: 'Ruta no encontrada.' }, 404, cors);
    }

    try {
      const publishKey = requireEnv(env, 'ADMIN_PUBLISH_KEY');
      const branch = env.GITHUB_BRANCH || 'main';
      const payload = await request.json();

      if (!payload || payload.publishKey !== publishKey) {
        return json({ error: 'Clave de publicación inválida.' }, 401, cors);
      }

      const files = Array.isArray(payload.files) ? payload.files : [];
      if (!files.length || files.length > 12) {
        return json({ error: 'Cantidad de archivos inválida.' }, 400, cors);
      }

      const message = String(payload.message || 'Actualización Admin Creaciones Ane').slice(0, 180);
      const results = [];
      for (const file of files) {
        results.push(await putFile(env, file, message, branch));
      }

      return json({ ok: true, files: results }, 200, cors);
    } catch (error) {
      return json({ error: error.message || 'Error interno.' }, 500, cors);
    }
  }
};
