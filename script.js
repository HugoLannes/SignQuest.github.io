const accessToken = 'MLY|8038426166262706|bf8941758911a289f05060367642d6b8';

//#region DEBUG
/**
 * Updates the debug screen with the provided message.
 * @param {string} message - The message to display in the debug area.
 */
function displayDebugInfo(message) {
    const debugContainer = document.getElementById('debug');
    if (debugContainer) {
        debugContainer.innerText += message + '\n';  // Set the debug message
    }f
}
//#endregion DEBUG

//#region FETCH STATIC IMAGE
/**
 * Fetches a static image from Mapillary using the provided image ID and displays it.
 * @param {string} imageId - The ID of the image to fetch and display.
 */
function fetchAndDisplayImage(imageId) {
    // Display the image ID in the debug screen

    // API URL to fetch the static image (thumbnail of 2048px width)
    const imageApiUrl = `https://graph.mapillary.com/${imageId}?access_token=${accessToken}&fields=thumb_2048_url,detections.value `;

    // Fetch the image URL from the API
    fetch(imageApiUrl)
        .then(response => response.json())
        .then(data => {
            // Display image logic
            const imgElement = document.createElement('img');
            imgElement.src = data.thumb_2048_url;
            const container = document.getElementById('image-container');
            container.innerHTML = '';
            container.appendChild(imgElement);
            displayDebugInfo(`Displaying image with ID: ${imageId}`);

            console.log(data)
            if (data.detections && data.detections.data && data.detections.data.length > 0) {
                data.detections.data.forEach(detection => {
                    displayDebugInfo(`Detection ID: ${detection.id}, Detection Value: ${detection.value}`)
                });
            } else {
                console.log('No detections found.');
            }

        })
        .catch(error => {
            console.error('Error fetching the image:', error);
            displayDebugInfo('Error fetching the image.');
        });
}
//#endregion FETCH STATIC IMAGE

// MAIN FUNCTION EXECUTION
// Replace this with the provided image ID to test
fetchAndDisplayImage('305314637880466');  // This image ID contains a sign
