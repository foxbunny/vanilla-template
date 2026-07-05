# Serve the static app with nginx. There is no build step — copy public/ in
# as-is. Build a standalone image with `docker build`, or skip this and use
# compose.yaml for live-editing during development.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/
