# down — stop the local Docker server

Stop and remove the nginx container that `/up` started. The boundary: it **stops
the server; it leaves your files, the image, and `public/` untouched.**

**Top guardrail: only touch this app's container.** Never stop or remove other
running containers.

## 1. Stop it

From the repo root run `docker compose down`. If you started it with the plain
`docker run` fallback (no compose plugin), run `docker rm -f vanilla-web` instead.

## 2. Confirm

`docker ps` should no longer list it, and http://localhost:5000 should stop
answering.

## Notes

- The mounted files are read-only — up and down never change anything under
  `public/`.
- Start it again with `/up` (see `skills/up.md`).
