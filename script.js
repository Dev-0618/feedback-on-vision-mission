// feedback-form-script.js

// This script handles dynamic field visibility based on stakeholder type,
// form submission logic for Google Sheets via Apps Script,
// and client-side session-based prevention for multiple submissions.

document.addEventListener('DOMContentLoaded', function() {
    const stakeHolderTypeSelect = document.getElementById('stakeHolderType');
    // Select all divs that contain stakeholder-specific fields
    const stakeholderSpecificFields = document.querySelectorAll('.stakeholder-specific-fields');
    const feedbackForm = document.getElementById('feedbackForm');
    const submitButton = feedbackForm ? feedbackForm.querySelector('button[type="submit"]') : null;

    // Define a key for localStorage to track submission status
    const SUBMISSION_KEY = 'atriaFeedbackSubmitted';

    // --- Message Box Elements (Replacing alert/confirm) ---
    // Create a simple message box dynamically
    const messageBox = document.createElement('div');
    messageBox.id = 'formMessageBox';
    messageBox.className = 'fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50 hidden';
    messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <p id="messageBoxText" class="text-lg font-semibold mb-4"></p>
            <button id="messageBoxClose" class="bg-[#004d99] hover:bg-[#003366] text-white font-bold py-2 px-4 rounded-lg">
                OK
            </button>
        </div>
    `;
    document.body.appendChild(messageBox);

    const messageBoxText = document.getElementById('messageBoxText');
    const messageBoxClose = document.getElementById('messageBoxClose');

    function showMessageBox(message) {
        messageBoxText.textContent = message;
        messageBox.classList.remove('hidden');
    }

    messageBoxClose.addEventListener('click', () => {
        messageBox.classList.add('hidden');
    });
    // --- End Message Box Elements ---

    // Function to check if the form has already been submitted in this browser
    function checkIfSubmitted() {
        if (localStorage.getItem(SUBMISSION_KEY) === 'true') {
            if (feedbackForm) {
                feedbackForm.style.display = 'none'; // Hide the form
                showMessageBox('Thank you for your feedback! You have already submitted this form.');
            }
            return true;
        }
        return false;
    }

    // Function to show/hide relevant fields based on selected stakeholder type
    function showHideFields() {
        const selectedType = stakeHolderTypeSelect.value;

        // First, hide all dynamic fields and remove their 'required' attribute
        stakeholderSpecificFields.forEach(function(fieldDiv) {
            fieldDiv.style.display = 'none'; // Hide the div
            // Remove 'required' from all inputs within this hidden div
            fieldDiv.querySelectorAll('input:not([type="radio"]), select, textarea').forEach(input => {
                input.removeAttribute('required');
            });
        });

        // Now, show the relevant dynamic fields and make their inputs required
        let currentFieldsDiv = null;
        if (selectedType === 'Student') {
            currentFieldsDiv = document.getElementById('studentFields');
        } else if (selectedType === 'Alumni') {
            currentFieldsDiv = document.getElementById('alumniFields');
        } else if (selectedType === 'Parent') {
            currentFieldsDiv = document.getElementById('parentFields');
        } else if (selectedType === 'Management and GC members') { // Updated ID for Management/GC
            currentFieldsDiv = document.getElementById('managementGcFields');
        } else if (selectedType === 'Employer') {
            currentFieldsDiv = document.getElementById('employerFields');
        } else if (selectedType === 'Entrepreneur') {
            currentFieldsDiv = document.getElementById('entrepreneurFields');
        } else if (selectedType === 'Other') { // New 'Other' section
            currentFieldsDiv = document.getElementById('otherFields');
        }

        if (currentFieldsDiv) {
            currentFieldsDiv.style.display = 'block'; // Show the div
            // Make inputs within the *currently visible* div required.
            // This ensures only fields relevant to the selected stakeholder are validated.
            currentFieldsDiv.querySelectorAll('input:not([type="radio"]), select, textarea').forEach(input => {
                input.setAttribute('required', 'required');
            });
        }
    }

    // Check submission status on page load
    if (checkIfSubmitted()) {
        return; // Stop further script execution if already submitted
    }

    // Attach the event listener to the stakeholder type dropdown
    if (stakeHolderTypeSelect) {
        stakeHolderTypeSelect.addEventListener('change', showHideFields);
        // Call the function once on page load to set the initial state
        showHideFields();
    } else {
        console.error('Stakeholder Type dropdown element not found. Please ensure id="stakeHolderType".');
    }

    // Handle form submission to Google Apps Script
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission (which would cause a redirect)

            // Perform client-side validation using the browser's native checkValidity()
            if (!this.checkValidity()) {
                console.warn('Form validation failed. Please fill in all required fields.');
                // The browser will show validation messages automatically
                return; // Stop the submission process
            }

            // Disable button and show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
                submitButton.classList.add('opacity-70', 'cursor-not-allowed');
            }

            // Collect form data using FormData and convert to URLSearchParams
            const formData = new FormData(this);
            const data = new URLSearchParams();
            for (const pair of formData.entries()) {
                data.append(pair[0], pair[1]);
            }

            // Get the Apps Script Web App URL from the form's action attribute
            const appsScriptUrl = this.action;

            try {
                const response = await fetch(appsScriptUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Required for direct submission to Apps Script from client-side
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: data, // Send URLSearchParams object
                });

                // Note: Due to 'no-cors' mode, response.ok will always be true
                // and response.json() will likely fail.
                // We rely on the Apps Script to successfully write to the sheet.
                // For more robust error handling, you'd need a CORS-enabled backend
                // or a different Apps Script deployment configuration.

                console.log('Form submission initiated. Check your Google Sheet for results.');
                showMessageBox('Thank you! Your feedback has been submitted successfully.');
                
                // Mark as submitted in localStorage
                localStorage.setItem(SUBMISSION_KEY, 'true');
                feedbackForm.reset(); // Reset the form fields
                showHideFields(); // Re-apply visibility logic after reset
                feedbackForm.style.display = 'none'; // Hide the form after successful submission

            } catch (error) {
                console.error('Error submitting form:', error);
                showMessageBox('There was an error submitting your feedback. Please try again.');
            } finally {
                // Re-enable button and reset text (only if form is still visible)
                if (submitButton && feedbackForm.style.display !== 'none') {
                    submitButton.disabled = false;
                    submitButton.textContent = 'SUBMIT';
                    submitButton.classList.remove('opacity-70', 'cursor-not-allowed');
                }
            }
        });
    } else {
        console.error('Feedback form element not found. Please ensure the form has id="feedbackForm".');
    }
});
