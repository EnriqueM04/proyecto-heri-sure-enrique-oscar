let temperatureChart, humidityChart, batteryChart;
let currentSelectedSensor = null; // Global variable to store the selected sensor
let sensorName = null;
let topicSensorActual = null;
let nombreSensorActual = null;

// Interface Colors
let colorTemp = 'rgb(255, 69, 0)';  // Bright Red
let colorHumi = 'rgb(0, 191, 255)'; // Cool blue
let colorBatt = 'rgb(50, 205, 50)'; // Bright green

async function fetchData(sensorTopic, sensorName) {
    try {
        const encodedTopic = encodeURIComponent(sensorTopic);
        const response = await fetch(`/api/sensor-data?sensor_topic=${encodedTopic}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        

        if (!data.length) {
            console.error("There is no data available for this sensor.");
            updateCurrentValues("Sensor Not available", null, null, null);
            return;
        }

        // Extract data for charts
        const timestamps = data.map(entry => new Date(entry.msg_time).toLocaleString());
        const temperatures = data.map(entry => entry.temperature);
        const humidities = data.map(entry => entry.humidity);
        const batteries = data.map(entry => entry.battery);

        // Get current values ​​(latest values)
        const latestTemperature = temperatures[temperatures.length - 1];
        const latestHumidity = humidities[humidities.length - 1];
        const latestBattery = batteries.some(b => b !== 255) ? batteries[batteries.length - 1] : 255;

        // Check if the maximum temperature on the sensor has been exceeded
        showTempAlert(sensorTopic, latestTemperature, max_temp=25);
        // Show/Hide Dropdown/h1 sensor topic
        showHideDropdown(sensorTopic);

        // Update the text boxes
        updateCurrentValues(sensorName, latestTemperature, latestHumidity, latestBattery);
        
        // Update COOKIES the topic and the
        setCookie("selected_sensor_topic", sensorTopic, 7);
        setCookie("selected_sensor_name", sensorName, 7);

        // Show or hide battery chart and graph
        toggleBatteryDisplay(latestBattery !== 255);

        // Render graphics
        renderChart('temperatureChart', 'Temperatura', timestamps, temperatures, colorTemp, colorTemp); // Bright Red
        renderChart('humidityChart', 'Humedad', timestamps, humidities, colorHumi, colorHumi); // Cool blue

        if (latestBattery !== 255) {
            renderChart('batteryChart', 'Batería', timestamps, batteries, colorBatt, colorBatt); // Bright green
        }

        // Update the table
        updateSensorTable(data);

    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}


function updateCurrentValues(selectedSensor, temperature, humidity, battery) {
    const sensorElement = document.getElementById("sensor-name-h");
    const sensorDropdown = document.getElementById("sensor-name-dropdown");
    const tempElement = document.getElementById("current-temperature");
    const humElement = document.getElementById("current-humidity");
    const batElement = document.getElementById("current-battery");

    if (sensorElement) sensorElement.textContent = selectedSensor || "Sensor desconocido"; // The 2 slashes are to avoid possible errors
    if (sensorDropdown) sensorDropdown.textContent = selectedSensor || "Sensor desconocido"; // The 2 slashes are to avoid possible errors
    if (tempElement) tempElement.textContent = `Temperatura: ${temperature !== null ? temperature.toFixed(0) + " °C" : "--"}`;
    if (humElement) humElement.textContent = `Humedad: ${humidity !== null ? humidity.toFixed(0) + " %" : "--"}`;
    if (batElement) batElement.textContent = `Batería: ${battery !== 255 ? battery.toFixed(0) + " %" : "--"}`;
}


function toggleBatteryDisplay(show) {
    // Funtion to show or hide the battery
    const spanCurrentTemperature = document.getElementById("span-current-temperature");
    const spanCurrentHumidity = document.getElementById("span-current-humidity");
    const spanCurrentBattery = document.getElementById("span-current-battery");
    const batElement = document.getElementById("current-battery"); // Battery Text
    const batChart = document.getElementById("batteryChart"); // Battery graffic

    if (show) {
        spanCurrentTemperature.className = "my-1 col-sm-12 col-md-4 col-lg-4";
        spanCurrentHumidity.className = "my-1 col-sm-12 col-md-4 col-lg-4";
        spanCurrentBattery.className = "my-1 col-sm-12 col-md-4 col-lg-4";
        spanCurrentBattery.style.display = "block";

        batElement.style.display = "block";
        batChart.style.display = "block";
    } else {
        spanCurrentTemperature.className = "my-1 col-sm-12 col-md-6 col-lg-6";
        spanCurrentHumidity.className = "my-1 col-sm-12 col-md-6 col-lg-6";
        spanCurrentBattery.style.display = "none";
        batElement.style.display = "none";
        batChart.style.display = "none";
    }
}

function renderChart(canvasId, label, labels, data, backgroundColor, borderColor) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const batteryChart_div = document.getElementById("batteryChart");

    if (canvasId === 'temperatureChart' && temperatureChart) temperatureChart.destroy();
    if (canvasId === 'humidityChart' && humidityChart) humidityChart.destroy();
    if (canvasId === 'batteryChart' && batteryChart) {
        batteryChart_div.className = "";
        batteryChart.destroy();
    }
    // Calculate dynamic limits with additional margin
    const margin = 5; // Extra margin
    const minValue = Math.round(Math.min(...data) - margin);
    const maxValue = Math.round(Math.max(...data) + margin);

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                zoom: {
                    pan: {
                        enabled: true, // Enable scrolling
                        mode: 'xy',
                        threshold: 10, // Motion sensitivity
                    },
                    limits: {
                        y: { min: minValue, max: maxValue } // Dynamic limit for the Y axis
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.1,
                        },
                        pinch: {
                            enabled: true,
                        },
                        drag: {
                            enabled: true,
                            threshold: 10,
                        },
                        mode: 'xy'
                    }
                },
            },
            scales: {
                x: {
                    title: { display: true, text: 'Fecha' }
                },
                y: {
                    title: { display: true, text: label },
                    min: minValue, // Dynamic initial limit
                    max: maxValue
                }
            }
        }
    });

    if (canvasId === 'temperatureChart') temperatureChart = chart;
    if (canvasId === 'humidityChart') humidityChart = chart;
    if (canvasId === 'batteryChart') {
        batteryChart_div.className = "container my-3 border border-1 rounded fs-2 fw-bolder";
        batteryChart = chart;
    }
}


let sensors = [];
// Show/Hide Dropdown/h1 sensor topic
function showHideDropdown(sensor_topic){
    const sensor_name_h1 = document.getElementById("div-sensor-name-h");
    const sensor_name_dropdown = document.getElementById("div-sensor-name-dropdown");
    if (sensor_topic == "<topic_seneor_temperture_alarm>"){
        sensor_name_dropdown.style.display = "block";
        sensor_name_h1.style.display = "none"; 
    } else {
        sensor_name_dropdown.style.display = "none";
        sensor_name_h1.style.display = "block";
    }
}

// Show/Hide Temperature Alarm
function showTempAlert(sensor_topic, temperature, max_temp=25){
    const div_alert = document.getElementById("temp_alarm");
    if (temperature >= max_temp && sensor_topic == "<topic_seneor_temperture_alarm>"){
        div_alert.style.display = "block"; 
    } else {
        div_alert.style.display = "none";
    }
}


// Show/Hide form
function toggleForm() {
    const form = document.getElementById("addDataForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

// Get sensors from the database
async function fetchSensors() {
    try {
        const response = await fetch('/api/sensors');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        sensors = await response.json();

        const sensorSelect = document.getElementById("sensorSelect");
        sensorSelect.innerHTML = ""; // Empty the dropdown

        sensors.forEach(sensor => {
            const option = document.createElement("option");
            option.value = sensor.sensor_topic;
            option.textContent = sensor.sensor_name;
            sensorSelect.appendChild(option);
        });

        updateFormFields(); // Update fields based on the selected sensor
    } catch (error) {
        console.error("Error al obtener sensores:", error);
    }
}

async function updateFormFields() {
    const selectedSensorTopic = document.getElementById("sensorSelect").value;

    try {
        // Get the data from the selected sensor
        const encodedTopic = encodeURIComponent(selectedSensorTopic);
        const response = await fetch(`/api/sensor-data?sensor_topic=${encodedTopic}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        const batteryField = document.getElementById("batteryField");

        // Determine if there are battery values ​​other than 255
        const hasBatteryData = data.some(entry => entry.battery !== 255);

        // Show or hide the battery field
        batteryField.style.display = hasBatteryData ? "block" : "none";
    } catch (error) {
        console.error("Error getting sensor data to update fields:", error);
    }
}

// Send data to the backend
async function submitData(event) {
    event.preventDefault(); // Prevent page refresh

    const formData = new FormData(document.getElementById("dataForm"));
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/add-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        alert("Datos añadidos correctamente.");
       
        // Update the selected sensor to the one just modified
        const addedSensorTopic = data.sensor_topic;
        currentSelectedSensor = addedSensorTopic;
        
        // Force update to corresponding sensor
        fetchData(addedSensorTopic, sensorName);
       // Clear the form
        document.getElementById("dataForm").reset();
        // Hide form
        toggleForm(); 
    } catch (error) {
        console.error("Error sending data:", error);
        alert("Error al añadir datos.");
    }
}

// Get sensors from the database and generate buttons
async function generateSensorButtons() {
    try {
        const response = await fetch('/api/sensors');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const sensors = await response.json();


        const sensorList = document.getElementById("sensor-list");
        sensorList.innerHTML = ""; // Empty the container

        sensors.forEach(sensor => {
            const li = document.createElement("li"); // Create the <li> element
            li.className = "nav-item"; // Add a class to the <li> (optional)
        
            const a = document.createElement("a"); // Create the <a> element
            a.className = "nav-link active";
            a.textContent = sensor.sensor_name; // Display sensor name as link text
            a.href = "#"; // Assign a link
            a.onclick = (event) => {
                event.preventDefault(); // Prevent default link action
                fetchData(sensor.sensor_topic, sensor.sensor_name); 
                topicSensorActual = sensor.sensor_topic;
                console.log("Current sensor from generateSensorButtons function: ", topicSensorActual);
                nombreSensorActual = sensor.sensor_name;
                console.log("Current sensor name from generateSensorButtons function: ", nombreSensorActual)
            };
        
            li.appendChild(a); // Add the <a> to the <li>
            sensorList.appendChild(li); // Add the <li> to the list container
        });
    } catch (error) {
        console.error("Error generating sensor buttons:", error);
    }
}

const socket = io(); // Connecting to WebSocket server

socket.on('connect', () => {
    console.log("Connected to WebSocket server");
});

// Listen to the 'new_data' event sent by the server
socket.on("new_data", (datos) => {
    console.log("New data event received from server:", datos);

    // Obtener el sensor seleccionado actualmente
    if (topicSensorActual && datos.sensor_topic === topicSensorActual) {
        console.log(`The selected sensor (${topicSensorActual}) matches the received one (${data.sensor_topic}). The data has been updated.`);
        fetchData(topicSensorActual, nombreSensorActual);
    } else {
        console.log(`The received sensor (${data.sensor_topic}) does not match the selected one (${topicSensorActual}). No action is taken.`);
    }
});

let rowsPerPage = 10; // Number of rows to display per page
let currentPage = 1; // Current page to control pagination

function updateSensorTable(data) {
    const table = document.querySelector("#sensor-data-table");
    const tableBody = table.querySelector("tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    // Reverse the order of the data
    const reversedData = data.slice().reverse();

    // Determine if there is valid battery data
    const hasBatteryData = reversedData.some(entry => entry.battery !== 255);

   // Update table headers
    const tableHeaderRow = table.querySelector("thead tr");
    tableHeaderRow.innerHTML = `
        <th style="width: ${hasBatteryData ? '25%' : '33%'}">Fecha y Hora</th>
        <th style="width: ${hasBatteryData ? '25%' : '33%'}">Humedad (%)</th>
        <th style="width: ${hasBatteryData ? '25%' : '33%'}">Temperatura (°C)</th>
        ${hasBatteryData ? '<th style="width: 25%">Batería (%)</th>' : ''}
    `;
    
    // Calculate the indexes of the data to display according to the current page
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    const paginatedData = reversedData.slice(startIdx, endIdx);

    // Create dynamic rows based on paginated data
    paginatedData.forEach(entry => {
        const row = document.createElement("tr");

        // Date and time
        const dateCell = document.createElement("td");
        dateCell.textContent = new Date(entry.msg_time).toLocaleString();
        row.appendChild(dateCell);

        // Humidity
        const humidityCell = document.createElement("td");
        humidityCell.textContent = entry.humidity.toFixed(2);
        row.appendChild(humidityCell);

        // Temperature
        const temperatureCell = document.createElement("td");
        temperatureCell.textContent = entry.temperature.toFixed(2);
        row.appendChild(temperatureCell);

        // Battery (optional)
        if (hasBatteryData) {
            const batteryCell = document.createElement("td");
            batteryCell.textContent = entry.battery !== 255 ? entry.battery.toFixed(2) : "N/A";
            row.appendChild(batteryCell);
        }

        tableBody.appendChild(row);
    });

    // Update pagination buttons
    updatePaginationControls(reversedData.length, reversedData);
}

function updatePaginationControls(totalRows, data) {
    const paginationContainer = document.querySelector("#pagination-controls");
    paginationContainer.innerHTML = ""; // Clear existing controls

    // Show less button
    const showLessButton = document.createElement("button");
    showLessButton.textContent = "Anterior";
    showLessButton.className = "btn btn-primary";
    showLessButton.disabled = currentPage === 1; // Disable if we are on the first page
    showLessButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            updateSensorTable(data); // currentData must be the variable that contains the complete data
        }
    };
    paginationContainer.appendChild(showLessButton);

    // Current row indicator
    const pageInfo = document.createElement("span");
    pageInfo.textContent = `Mostrando ${Math.min(currentPage * rowsPerPage, totalRows)} de ${totalRows} filas`;
    paginationContainer.appendChild(pageInfo);

    // Show more button
    const showMoreButton = document.createElement("button");
    showMoreButton.textContent = "Siguiente";
    showMoreButton.className = "btn btn-primary";
    showMoreButton.disabled = currentPage * rowsPerPage >= totalRows; // Disable if we already show all rows
    showMoreButton.onclick = () => {
        if (currentPage * rowsPerPage < totalRows) {
            currentPage++;
            updateSensorTable(data);
        }
    };
    paginationContainer.appendChild(showMoreButton);
}

// COOKIES
// Function to create a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Days to milliseconds
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/; Secure; SameSite=Strict`;
}

// Function to read a cookie
function getCookie(name, defaultValue = "defaultValue", days = 7) {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) {
            return value; // Returns the value if the cookie exists
        }
    }
    // If the cookie does not exist, create it with the default value
    console.warn(`Cookie "${name}" not found. Creating a new one.`);
    setCookie(name, defaultValue, days);
    return defaultValue; // Returns the default value
}

// Function to delete a cookie
function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Call generateSensorButtons on page load
document.addEventListener("DOMContentLoaded", () => {
    const selectedSensorTopic = getCookie("selected_sensor_topic", "<topic_sensor_piedra");
    const selectedSensorName = getCookie("selected_sensor_name", "Sensor Piedra");
    
    currentSelectedSensor = selectedSensorTopic;
    sensorName = selectedSensorName;
    console.log("Value of 'selected_sensor_topic' cookie:", selectedSensorTopic);
    console.log("Value of 'selected_sensor_name' cookie:", selectedSensorName);

    fetchData(selectedSensorTopic, selectedSensorName) // Display/Update data
    fetchSensors(); // Update the form
    generateSensorButtons(); // Generate buttons dynamically
});
