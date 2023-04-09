FROM node:16-alpine

EXPOSE 4002

WORKDIR /home/app

COPY . .

RUN yarn install
RUN yarn build

#====================================RUN===============================================
CMD ["yarn", "start"]
