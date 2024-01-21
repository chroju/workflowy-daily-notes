export const html = `
<!DOCTYPE html>
<html>
<head>
	<title>Workflowy Daily Notes</title>
  <style>
    body, html {
      margin: 0;
      height: 100%;
      width: 100%;
      display: flex;
      background: #2E3440;
      position: relative;
    }

    textarea {
      flex-grow: 1;
      width: 100%;
      padding: 28%; /* Adjusted for mobile view */
      border: none;
      color: #ECEFF4;
      background: #2e3440;
      resize: none;
      font-size: 4vh; /* Adjusted for mobile view */
      /* font is serif for Japanese characters */
      font-family: Hiragino Mincho ProN, Yu Mincho, serif;
    }

    #submitButton, #settingButton {
      position: fixed;
      bottom: 5%;
      padding: 10% 0; /* Increased padding for easier clicking */
      border: none;
      border-radius: 10px;
      font-size: 4vh; /* Adjusted for mobile view */
      color: #d8dee9;
      background: transparent;
      border: #4c566a solid 1px;
      cursor: pointer;
      transition: filter 0.5s; /* Transition effect */
      width: 45%; /* Adjusted width for two buttons */
    }

    #submitButton:hover, #settingButton:hover {
      filter: brightness(120%);
    }

    #submitButton {
      right: 5%;
      background: #434C5E;
    }

    #settingButton {
      left: 5%;
    }

    .active { /* Button color change upon clicking */
      background-color: darkgray;
    }

    /* Setting modal */
    #settingModal {
      display: none; /* Hidden by default */
      position: fixed;
      z-index: 1; /* Sit on top */
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background-color: rgba(0,0,0,0.4);
    }

    /* Setting modal content */
    .modal-content {
      background-color: #fefefe;
      margin: 15% auto;
      padding: 20px;
      border: 1px solid #888;
      width: 80%;
    }

    /* Setting modal close button */
    .close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
    }

    .close:hover,
    .close:focus {
      color: black;
      text-decoration: none;
      cursor: pointer;
    }

    /* Setting modal input field */
    #tokenInput {
      width: 100%;
      padding: 12px 20px;
      margin: 8px 0;
      box-sizing: border-box;
    }

    @media (min-width: 768px) {
      textarea {
        padding: 50px;
        font-size: 1.5em; /* Larger font size for desktop view */
      }

      #submitButton, #settingButton {
        bottom: 20px;
        padding: 30px;
        font-size: 1.5em; /* Larger font size for desktop view */
        width: 45%; /* Adjusted width for two buttons */
      }

      #submitButton {
        right: 20px;
      }

      #settingButton {
        left: 20px;
      }
    }
  </style>
</head>
<body>
  <textarea id="textarea"></textarea>
  <button id="submitButton" type="button">Submit</button>
  <button id="settingButton" type="button">Set Auth token</button>

  <!-- The Setting Modal -->
  <div id="settingModal" class="modal">
    <div class="modal-content">
      <span class="close">&times;</span>
      <p>Bearer Token</p>
      <input id="tokenInput" type="text">
      <button id="saveButton" type="button">Save</button>
    </div>
  </div>

  <script>
    const submitButton = document.getElementById('submitButton');
    const settingButton = document.getElementById('settingButton');
    const saveButton = document.getElementById('saveButton');
    const textarea = document.getElementById('textarea');
    const tokenInput = document.getElementById('tokenInput');
    const settingModal = document.getElementById ('settingModal');
    const closeSpan = document.getElementsByClassName('close')[0];

    // When the user clicks on the button, open the modal
    settingButton.onclick = function() {
      settingModal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    closeSpan.onclick = function() {
      settingModal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == settingModal) {
        settingModal.style.display = "none";
      }
    }

    saveButton.addEventListener('click', function() {
      localStorage.setItem('bearerToken', tokenInput.value);
      settingModal.style.display = "none";
    });

    const bearerToken = localStorage.getItem('bearerToken') || '';

    submitButton.addEventListener('click', function() {
      // Change button to loading state
      submitButton.innerHTML = 'Wait...';
      submitButton.disabled = true;
      fetch('./send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${bearerToken}\`
        },
        body: JSON.stringify({ text: textarea.value })
      }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
         return response.json();
      }).then(data => {
        // Handle response data
        showAlert('Success', true);
      }).catch(error => {
        // Handle error
        showAlert('Fail', false);
      }).finally(() => {
        submitButton.innerHTML = 'Submit';
        submitButton.disabled = false;
      });
    });

    function showAlert(message, isSuccess) {
      // Create alert div
      const alertDiv = document.createElement('div');
      alertDiv.textContent = message;
      alertDiv.style.position = 'fixed';
      alertDiv.style.bottom = '20px';
      alertDiv.style.right = '20px';
      alertDiv.style.padding = '10px';
      alertDiv.style.backgroundColor = isSuccess ? 'lightgreen' : 'lightcoral';
      alertDiv.style.color = 'white';

      // Append to body
      document.body.appendChild(alertDiv);

      // Remove alert div after 3 seconds
      setTimeout(() => {
        document.body.removeChild(alertDiv);
      }, 3000);
    }
  </script>
</body>
</html>
`;
