# Setup and build the python server

FROM python:2

# Installing dependencies for linux installation of opencv
RUN apt-get update && \
        apt-get install -y \
        build-essential \
        cmake \
        git \
        wget \
        unzip \
        yasm \
        pkg-config \
        libswscale-dev \
        libtbb2 \
        libtbb-dev \
        libjpeg-dev \
        libpng-dev \
        libtiff-dev \
	libpng16-16 \
        libavformat-dev \
        libpq-dev \
        python-scipy

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# GUI (if you want to use GTK instead of Qt, replace 'qt5-default' with 'libgtkglext1-dev' and remove '-DWITH_QT=ON' option in CMake):

RUN wget https://github.com/opencv/opencv/archive/2.4.13.3.zip \
&& unzip 2.4.13.3.zip \
&& mkdir /opencv-2.4.13.3/cmake_binary \
&& cd /opencv-2.4.13.3/cmake_binary \
&& cmake -DWITH_QT=OFF \
        -DWITH_OPENGL=ON \
        -DFORCE_VTK=OFF \
        -DWITH_TBB=ON \
        -DWITH_GDAL=ON \
        -DWITH_XINE=ON \
        -DBUILD_EXAMPLES=OFF \
        -DENABLE_PRECOMPILED_HEADERS=OFF .. \
&& make install \
&& rm /2.4.13.3.zip \
&& rm -r /opencv-2.4.13.3

# Run the image as a non-root user
RUN adduser myuser
USER myuser

ADD ./server_python /usr/app/server_python/
WORKDIR /usr/app/server_python/

EXPOSE 9699


# Setup and build the client

FROM node:10 as client

WORKDIR /usr/app/client/
COPY client/package*.json ./
RUN npm install -qy
COPY client/ ./
RUN npm run build


# Setup the server

FROM node:9.4.0-alpine

WORKDIR /usr/app/
COPY --from=client /usr/app/client/build/ ./client/build/

WORKDIR /usr/app/server/
COPY server/package*.json ./
RUN apk add --no-cache make gcc g++ python && \
    npm install -qy && \
    apk del make gcc g++ python 
COPY server/ ./

ENV PORT 8000

EXPOSE 8000

CMD ["nodemon", "index.js"]
