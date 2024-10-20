const accessToken = 'MLY|8038426166262706|bf8941758911a289f05060367642d6b8';

// Define the central point of the bounding box (Rue Sainte-Catherine, Bordeaux)
let centerLat = 44.83835;  // Central latitude
let centerLon = -0.5738;   // Central longitude

// Adjustable bounding box size (scale factor)
let scaleFactor = 0.002;  // Adjust this variable to increase or decrease the bounding box size

// Create the bounding box based on the center and the scale factor
function createBoundingBox() {
    let minLon = centerLon - scaleFactor;
    let minLat = centerLat - scaleFactor;
    let maxLon = centerLon + scaleFactor;
    let maxLat = centerLat + scaleFactor;
    return `${minLon},${minLat},${maxLon},${maxLat}`;
}

let bbox = createBoundingBox();  // Bounding box around central point using the scale factor

//#region DEBUG
function displayDebugInfo(message) {
    const debugContainer = document.getElementById('debug');
    if (debugContainer) {
        debugContainer.innerText += message + '\n';  // Set the debug message
    }
}
function clearDebugWindow() {
    const debugContainer = document.getElementById('debug');
    if (debugContainer) {
        debugContainer.innerHTML = '';  // Clear the content of the debug window
    }
}
//#endregion DEBUG

//#region FETCH DETAILED DETECTION DATA
let scannedImages = 0;  // Total images scanned
let validImages = 0;    // Images containing "general directions"
let ignoredImages = 0;  // Images without "general directions"
let imagesWithSigns = [];  // Store valid images for later display

function fetchDetectionDetails(imageId) {
    const detectionApiUrl = `https://graph.mapillary.com/${imageId}/detections?access_token=${accessToken}&fields=image,value,geometry`;

    fetch(detectionApiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Detection data:', data);  // Log detection data for debugging
            scannedImages++;  // Increment the total images scanned

            if (data && data.data && data.data.length > 0) {
                let hasGeneralDirection = false;

                // Post-process detections to check for 'information--general-directions--g1'
                data.data.forEach(detection => {
                    if (detection.value === 'information--general-directions--g1') {
                        displayDebugInfo(`Found 'general directions' sign in image ID: ${imageId}`);
                        imagesWithSigns.push(imageId);  // Add to the list of valid images
                        validImages++;  // Increment valid images count
                        hasGeneralDirection = true;
                    }
                });

                if (!hasGeneralDirection) {
                    ignoredImages++;  // Increment ignored images count
                }
            } else {
                displayDebugInfo(`No detailed detections found for image ID: ${imageId}`);
                ignoredImages++;  // Increment ignored images count
            }

            // If all images have been scanned, display the summary and the images
            if (scannedImages === 50) {
                displaySummary();
                displayAllImagesWithSigns();  // Display all valid images at the end
            }
        })
        .catch(error => {
            console.error('Error fetching detection details:', error);
            displayDebugInfo('Error fetching detection details.');
            ignoredImages++;  // Increment ignored images count in case of error
        });
}
//#endregion FETCH DETAILED DETECTION DATA

//#region SEARCH FOR DETECTIONS IN BORDEAUX
function searchForDetectionsInBordeaux() {
    scannedImages = 0;  // Reset counters before search
    validImages = 0;
    ignoredImages = 0;
    imagesWithSigns = [];  // Clear previous valid images

    bbox = createBoundingBox();  // Update bounding box based on scale factor
    const searchUrl = `https://graph.mapillary.com/images?access_token=${accessToken}&fields=id,geometry,detections&bbox=${bbox}&limit=50`;  // Limit set to 50 images

    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Search data:', data);  // Log the full response to debug
            const images = data.data || [];
            if (images.length > 0) {
                displayDebugInfo(`Found ${images.length} images in Bordeaux.`);

                images.forEach(image => {
                    //displayDebugInfo(`Scanning Image ID: ${image.id}, Coordinates: ${image.geometry.coordinates}`);
                    fetchDetectionDetails(image.id);  // Fetch detailed detection data for the image
                });
            } else {
                displayDebugInfo('No images found in this area.');
            }
        })
        .catch(error => {
            console.error('Error fetching images:', error);
            displayDebugInfo('Error fetching images.');
        });
}
//#endregion SEARCH FOR DETECTIONS IN BORDEAUX

//#region FETCH STATIC IMAGE AND DISPLAY ALL IMAGES WITH SIGNS
function fetchAndDisplayImage(imageId) {
    const imageApiUrl = `https://graph.mapillary.com/${imageId}?access_token=${accessToken}&fields=thumb_2048_url`;

    fetch(imageApiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Image data:', data);  // Log the full response to debug the API data

            if (data.thumb_2048_url) {  // Check if the thumb_2048_url exists
                const imgElement = document.createElement('img');
                imgElement.src = data.thumb_2048_url;
                imgElement.style = 'margin: 10px; max-width: 200px;';  // Style for each image

                const imagesContainer = document.getElementById('images-container');
                imagesContainer.appendChild(imgElement);  // Append the image to the container
            } else {
                displayDebugInfo(`No thumbnail URL found for image ID: ${imageId}`);
            }
        })
        .catch(error => {
            console.error('Error fetching the image:', error);
            displayDebugInfo(`Error fetching the image: ${error.message}`);
        });
}

// Display all images with 'general directions' signs at the end of the search
function displayAllImagesWithSigns() {
    const imagesContainer = document.getElementById('images-container');
    imagesContainer.innerHTML = '';  // Clear previous images

    imagesWithSigns.forEach(imageId => {
        fetchAndDisplayImage(imageId);  // Fetch and display each image
    });
}
//#endregion FETCH STATIC IMAGE AND DISPLAY ALL IMAGES WITH SIGNS

//#region DISPLAY SUMMARY
function displaySummary() {
    displayDebugInfo(`\nSummary:\nScanned Images: ${scannedImages}\nValid Images (with general directions): ${validImages}\nIgnored Images: ${ignoredImages}`);
}
//#endregion DISPLAY SUMMARY

// MAIN FUNCTION EXECUTION
const button = document.createElement('button');
button.innerText = 'Search for General Directions Signs in Bordeaux';
button.onclick = function() {
    clearDebugWindow();  // Clear the debug window before running the search
    searchForDetectionsInBordeaux();  // Execute the search function
};
document.body.appendChild(button);
document.body.insertBefore(button, document.body.firstChild);

// Create a container to display all images at the end of the search
const imagesContainer = document.createElement('div');
imagesContainer.id = 'images-container';
document.body.appendChild(imagesContainer);
