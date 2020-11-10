FROM node:lts-alpine
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app
COPY package.json package.json
RUN npm install

COPY . .
EXPOSE 4300
ENV PORT=4300
ENV JWT_SECRET="dkfji39f3qs20s@EIjieve\\edei392324cEHcw1\$evodv"
ENV DB_URI=mongodb://db:27017/calipsa


CMD [ "npm", "start" ]