# Proyecto Heri-Sure: Dashboard IoT con Flask

Este proyecto desarrolla un sistema IoT para monitorizar en tiempo real datos de sensores que miden temperatura y humedad, utilizando el módulo **RAK3172** y la plataforma **The Things Network (TTN)**. Incluye un **dashboard web interactivo** para la visualización y control remoto de alarmas.

## 📝 Introducción
El sistema consta de:
- Un módulo IoT configurado con **LoRaWAN** para transmitir datos.
- Un servidor Flask que recibe, almacena y gestiona los datos en una base de datos **MySQL**.
- Un dashboard web diseñado con **Bootstrap**, que muestra datos históricos y en tiempo real.

## 🎯 Objetivos
1. Configurar el módulo RAK3172 para enviar datos a TTN.
2. Diseñar un dashboard para:
   - Visualizar datos mediante gráficos y tablas.
   - Encender/apagar remotamente una alarma de temperatura.
   - Gestionar datos en tiempo real mediante sockets.
3. Integrar sensores adicionales al sistema.

## 🛠️ Tecnologías utilizadas
- **XAMPP**: Servidor MySQL local para gestionar la base de datos.
- **Flask**: Backend para la creación de la aplicación web.
- **The Things Network (TTN)**: Plataforma para redes IoT basadas en LoRaWAN.
- **Arduino IDE**: Configuración y programación del módulo RAK3172.
- **Bootstrap**: Diseño responsivo del frontend.
- **Chart.js**: Visualización de gráficos interactivos en el dashboard.

## 📂 Estructura del Proyecto
```plaintext
dashboard/
│
├── app/                             # Carpeta principal del código de la aplicación
│   ├── _init_.py                    # Inicializa la aplicación Flask
│   ├── routes.py                    # Define las rutas de la aplicación
│   ├── models.py                    # Maneja la conexión y lógica de la base de datos
│   ├── sockets.py                   # Configuración de Flask-SocketIO
│   ├── ttn_client.py                # Código para interactuar con TTN
│   ├── ttn_sensor_alarm.py          # Código para encender o apagar la alarma del sensor
│   ├── templates/                   # Archivos HTML (frontend)
│   │   └── dashboard.html           # Página principal del dashboard
│   ├── static/                      # Archivos estáticos (CSS, JS, imágenes)
│   │   ├── css/
│   │   │   └── dashboard.css        # Estilos personalizados
│   │   └── js/
│   │       └── dashboard.js         # Scripts de frontend
│
├── config.py                        # Configuración de la aplicación
├── run.py                           # Punto de entrada de la aplicación
└── requirements.txt                 # Dependencias del proyecto
=======
# proyecto-heri-sure-enrique-oscar
Este proyecto desarrolla un sistema IoT para monitorizar en tiempo real datos de sensores que miden temperatura y humedad, utilizando el módulo **RAK3172** y la plataforma **The Things Network (TTN)**. Incluye un **dashboard web interactivo** para la visualización y control remoto de alarmas.
>>>>>>> 45a74ffb3e0ab66e11e1cd4c79657d404582f5fa
