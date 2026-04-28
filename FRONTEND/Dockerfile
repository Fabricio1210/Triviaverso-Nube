FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY . .
EXPOSE 8080
CMD ["serve", ".", "-l", "8080"]