FROM node:15-alpine
    
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \ PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
RUN yarn add puppeteer@5.2.1

RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app       
COPY package.json /usr/src/app
RUN npm install            
COPY . /usr/src/app        
EXPOSE 9000                
CMD ["node", "index.js"]
