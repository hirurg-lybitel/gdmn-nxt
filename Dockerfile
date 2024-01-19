FROM hirurglybitel/gdmn-firebird-pm2:latest AS builder
WORKDIR /usr/app

ARG NX_BRANCH
ARG NX_HOST_IP
ARG NX_SERVER_PORT
ARG NX_SOCKET_NOTIFICATIONS_PORT
ARG NX_SOCKET_STREAMING_UPDATE_PORT
ARG NX_MUI_LICENSE

ENV NX_BRANCH=${NX_BRANCH:-no-branch}
ENV NX_HOST_IP=$NX_HOST_IP
ENV NX_SERVER_PORT=$NX_SERVER_PORT
ENV NX_SOCKET_NOTIFICATIONS_PORT=$NX_SOCKET_NOTIFICATIONS_PORT
ENV NX_SOCKET_STREAMING_UPDATE_PORT=$NX_SOCKET_STREAMING_UPDATE_PORT
ENV NX_MUI_LICENSE=$NX_MUI_LICENSE

COPY . .

RUN yarn install --network-timeout 1000000 --immutable --immutable-cache --check-cache --parallel && \
    yarn cache clean && \
    yarn nx clear-cache && \
    yarn build

FROM hirurglybitel/gdmn-firebird-pm2:latest AS server
WORKDIR /usr/app
COPY --from=builder /usr/app/dist/apps/gdmn-nxt-server /usr/app/dist/apps/gdmn-nxt-server
COPY --from=builder /usr/app/node_modules /usr/app/node_modules
COPY ssl/* /usr/app/ssl/
COPY pm2.config.js .

ARG PM2_PUBLIC_KEY
ARG PM2_SECRET_KEY

ENV PM2_PUBLIC_KEY=$PM2_PUBLIC_KEY
ENV PM2_SECRET_KEY=$PM2_SECRET_KEY

ENTRYPOINT ["pm2-runtime", "start", "pm2.config.js"]

FROM nginx:stable-alpine3.17-slim AS client
COPY --from=builder /usr/app/dist/apps/gdmn-nxt-web  /usr/share/nginx/html
COPY ssl /etc/nginx/ssl/
COPY nginx.conf /etc/nginx/conf.d/
RUN rm /etc/nginx/conf.d/default.conf


ENTRYPOINT ["nginx", "-g", "daemon off;"]
