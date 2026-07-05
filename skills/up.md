# up — start the local Docker server

Bring the app up in nginx via Docker and print the URL. The boundary: it **starts
the server; it doesn't build, edit, or deploy anything.**

**Top guardrail: don't route around a busy port.** If port 5000 is taken, say what
holds it and stop — don't quietly pick another port, or the URL people bookmark
moves under them.

## 1. Start it

From the repo root run `docker compose up -d`. That reads `compose.yaml`, mounts
`public/` into nginx read-only, and maps host port 5000 to the container's port 80.

If the compose plugin isn't installed (`docker: unknown command: docker compose`),
run the same thing directly:

    docker run -d --name vanilla-web -p 5000:80 \
      -v "$PWD/public:/usr/share/nginx/html:ro" \
      -v "$PWD/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
      nginx:alpine

## 2. Confirm and print the URL

`curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/design-system.html`
should print `200`. Then tell the user the app is at http://localhost:5000 (design
system at `/design-system.html`).

## Notes

- Edits under `public/` are live — the folder is mounted, so just refresh; there's
  no rebuild step. Stop it with `/down` (see `skills/down.md`).
- "address already in use" means something already holds port 5000 — find it and
  report it, don't switch ports.
