document.addEventListener('DOMContentLoaded', function() {
    const stakeHolderTypeSelect = document.getElementById('stakeHolderType');
    const stakeholderSpecificFields = document.querySelectorAll('.stakeholder-specific-fields');

    // Function to show/hide relevant fields based on selected stakeholder type
    function showHideFields() {
        const selectedType = stakeHolderTypeSelect.value;

        // Hide all dynamic fields first
        stakeholderSpecificFields.forEach(function(fieldDiv) {
            fieldDiv.style.display = 'none';
            // Also make inputs within these hidden divs not required to allow submission
            fieldDiv.querySelectorAll('input, select, textarea').forEach(input => {
                input.removeAttribute('required');
            });
        });

        // Show the relevant dynamic fields and make their inputs required
        let currentFieldsDiv = null;
        if (selectedType === 'Student') {
            currentFieldsDiv = document.getElementById('studentFields');
        } else if (selectedType === 'Alumni') {
            currentFieldsDiv = document.getElementById('alumniFields');
        } else if (selectedType === 'Parent') {
            currentFieldsDiv = document.getElementById('parentFields');
        } else if (selectedType === 'Faculty and Staff') {
            currentFieldsDiv = document.getElementById('facultyStaffFields');
        } else if (selectedType === 'Employer') {
            currentFieldsDiv = document.getElementById('employerFields');
        } else if (selectedType === 'Entrepreneur') {
            currentFieldsDiv = document.getElementById('entrepreneurFields');
        }

        if (currentFieldsDiv) {
            currentFieldsDiv.style.display = 'block';
            // Make inputs within the *currently visible* div required.
            // You might need to adjust which fields are truly 'required' based on your actual data collection needs.
            // For now, setting all text/select/textarea fields within the visible div as required.
            currentFieldsDiv.querySelectorAll('input:not([type="radio"]), select, textarea').forEach(input => {
                input.setAttribute('required', 'required');
            });
        }
    }

    // Attach the event listener to the stakeholder type dropdown
    stakeHolderTypeSelect.addEventListener('change', showHideFields);

    // Call the function once on page load to set the initial state
    showHideFields();

    // Basic form submission handling (for demonstration, replace with actual GForm submission)
    const feedbackForm = document.getElementById('feedbackForm');
    feedbackForm.addEventListener('submit', function(event) {
        // Prevent default form submission to handle it via JavaScript
        event.preventDefault();

        // Perform client-side validation if needed (browser's native validation for 'required' attributes works first)
        if (!this.checkValidity()) {
            // If the form is invalid, the browser will display validation messages.
            return;
        }

        // Collect form data (for Google Forms, this usually involves directly submitting to its action URL)
        const formData = new FormData(this);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        console.log('Form Data to be Submitted:', data);

        // --- Google Forms Submission Placeholder ---
        // In a real scenario, you would redirect to the Google Form's submission URL
        // or make an AJAX request. Since we are using a placeholder URL:
        // window.location.href = this.action + '?' + new URLSearchParams(data).toString();
        // Or, if submitting directly without redirecting:
        // fetch(this.action, {
        //     method: 'POST',
        //     body: formData, // For Google Forms, usually raw FormData works best
        //     mode: 'no-cors' // Google Forms typically requires 'no-cors' mode for direct submission from client-side JS
        // })
        // .then(response => {
        //     alert('Feedback submitted successfully! (This is a placeholder message. Ensure XYXYXYX are replaced with actual Google Form entry IDs and the action URL is correct.)');
        //     feedbackForm.reset();
        //     showHideFields(); // Reset dynamic fields after form reset
        // })
        // .catch(error => {
        //     console.error('Error submitting form:', error);
        //     alert('There was an error submitting your feedback.');
        // });
        // --- End Google Forms Submission Placeholder ---

        alert('Feedback submitted successfully! (This is a placeholder message. In a real scenario, this would send data to Google Forms via the form\'s action URL.)');
        feedbackForm.reset(); // Reset the form fields
        showHideFields(); // Re-apply visibility logic after reset
    });
});