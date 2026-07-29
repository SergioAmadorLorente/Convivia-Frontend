export const API_CONFIG = {

  //MODO CON BACKEND MANUAL
  // y reemplaza la IP con la IP local de tu computadora (por ejemplo, 192.168.1.x)
  //BASE_URL: "http://0.0.0.0:5082/api", // Reemplazar 0.0.0.0 por tu IP

  //MODO CON BACKEND 24/7 ONLINE
  BASE_URL: "https://convivia-backend-1ytr.onrender.com/api",
  timeout: 60000,// esto es para evitar la primera llamada de Render falle ya que levanta el srvicio
};
