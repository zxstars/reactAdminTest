FROM artifactory.cloud.ingka-system.cn/cn-digital-hub-docker-virtual/baseimages/node:16-aid-base as build
ARG DOCKER_ENV_PARAMS
WORKDIR /home/build
USER root
ADD . /home/build/
ADD .npmrc /root/.npmrc
RUN export NODE_OPTIONS=--max_old_space_size=7168 && \
    npm cache clean -f && \
    npm install -g pnpm@v7.13.6 && \ 
    pnpm install && \ 
    pnpm run build:${DOCKER_ENV_PARAMS}

FROM artifactory.cloud.ingka-system.cn/cn-digital-hub-docker-virtual/baseimages/nginx:1.21
COPY --from=build /home/build/build /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html
