# FROM mongo:latest
FROM node:9
# FROM ubuntu:latest
# # Create a directory where our app will be placed
RUN mkdir -p /app && mkdir -p /data/db

# # Change directory so that our commands run inside this new directory
WORKDIR /app

# # RUN git clone https://github.com/IHTSDO/sct-snapshot-rest-api.git
COPY . /app/sct-snapshot-rest-api

WORKDIR /app/sct-snapshot-rest-api

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5 && echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/3.6 main" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list \
  && apt-get update && apt-get install -y \
  mongodb-org \
  && npm install

# # Expose the port the app runs in
EXPOSE 9999
# EXPOSE 27017
# EXPOSE 28017
# # Start mongo

# # Serve the app
CMD ./docker-wrapper.sh
