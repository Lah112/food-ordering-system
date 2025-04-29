# React + Vite

#cd/frontend/cd web-app/OrderFrontend/npm run dev
#local host:3000

#backend

#crate image

docker build -t foodback2:v2 .

#with volume run container backend

docker run --name fooy -p 5000:5000 --rm -v ${PWD}:/app -v /app/node_modules foodback2:v2 

#frontend image creation

docker build --no-cache -t fr3 .

#run container

docker run --name foodfront -p 3001:3000 --rm -v /app/node_modules -v ${PWD}:/app -e CHOKIDAR_USEPOLLING=true fr3

#Download Docker backend

docker pull nethmiumaya5/foodback2:v2 

#Download Docker frontend

docker pull nethmiumaya5/fr3





