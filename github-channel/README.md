# Canal seguro GitHub para Creaciones Ane

Este canal permite que el modo Admin publique cambios en GitHub sin poner el token dentro de `index.html`.

## Que hace

- Recibe `index.html` y archivos nuevos desde el Admin.
- Valida una clave privada de publicacion.
- Sube o actualiza archivos en GitHub usando la API oficial.
- Solo permite rutas seguras: `index.html`, `fotos_mpg/`, y `assets/`.

## 1. Crear token seguro en GitHub

Crea un Fine-grained personal access token con acceso solo al repositorio:

- Repositorio: `eduvc71-code/creaciones-ane`
- Permiso: `Contents: Read and write`

No pegues ese token en la pagina web.

## 2. Crear Worker

1. Instala Wrangler si no lo tienes:

```powershell
npm install -g wrangler
```

2. Copia el ejemplo:

```powershell
Copy-Item wrangler.toml.example wrangler.toml
```

3. Edita `wrangler.toml` y cambia `ALLOWED_ORIGINS` por el dominio real de tu pagina.

4. Guarda los secretos:

```powershell
wrangler secret put GITHUB_TOKEN
wrangler secret put ADMIN_PUBLISH_KEY
```

`GITHUB_TOKEN` es el token de GitHub.
`ADMIN_PUBLISH_KEY` es una clave privada inventada por ti para publicar desde Admin. No debe ser igual a la clave visible del HTML.

5. Publica el Worker:

```powershell
wrangler deploy
```

El endpoint final sera:

```text
https://TU-WORKER.workers.dev/api/publish
```

## 3. Usarlo desde Admin

1. Abre la pagina publicada.
2. Doble click en `Admin`.
3. Entra con la clave Admin actual.
4. Haz cambios.
5. Pulsa `Enviar a GitHub`.
6. Pega la URL del endpoint si la pide.
7. Pega la clave `ADMIN_PUBLISH_KEY`.

## Importante

El token de GitHub queda guardado en Cloudflare Worker como secreto. La pagina solo conoce la URL del canal, no el token.
