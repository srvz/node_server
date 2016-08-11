FROM huokr/alpine:latest

# Create app directory and bundle app source
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

# Install node.js and app dependencies
RUN NODE_ENV=production npm install \
  && npm uninstall -g npm \
  && rm -rf /tmp/* \
  && rm -rf /root/.npm/

# Expose port
EXPOSE 3080

CMD [ "node", "index.js" ]