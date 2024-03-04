

//loop 
document.addEventListener("DOMContentLoaded", function() {
    const questionsContainer = document.getElementById('questions-container');

    // Number of questions to generate
    const numQuestions = 40;

    for (let i = 1; i <= numQuestions; i++) {
      const questionBlock = document.createElement('div');
      questionBlock.classList.add('question-block');

      const mcqDiv = document.createElement('div');
      mcqDiv.classList.add('mcq');

      const questionDiv = document.createElement('div');
      questionDiv.classList.add('question');
      const questionText = document.createElement('p');
      questionText.textContent = `Q ${i}:`;
      questionDiv.appendChild(questionText);

      const optionsDiv = document.createElement('div');
      optionsDiv.classList.add('options');
      for (let j = 1; j <= 4; j++) {
        const optionLabel = document.createElement('label');
        const optionInput = document.createElement('input');
        const optionSpan = document.createElement('span');
        optionInput.setAttribute('type', 'checkbox');
        optionInput.setAttribute('name', `q${i}_option${j}`);

        optionSpan.setAttribute('name',`q${i}_option${j}`)

        optionInput.classList.add('styled-checkbox'); // Add class for styling
        optionLabel.appendChild(optionInput);
        /* optionLabel.appendChild(document.createTextNode(` ${j}`)); */

        // Create a span element for the number
        const numberSpan = document.createElement('span');
        numberSpan.textContent = j;

        // Append the span element to the label
        optionLabel.appendChild(numberSpan);

        optionsDiv.appendChild(optionLabel);
      }

      mcqDiv.appendChild(questionDiv);
      mcqDiv.appendChild(optionsDiv);
      questionBlock.appendChild(mcqDiv);

      const hr = document.createElement('hr');
      questionBlock.appendChild(hr);

      questionsContainer.appendChild(questionBlock);
    }
});


 // reset button
  document.addEventListener("DOMContentLoaded", function() {
    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', function() {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(function(checkbox) {
        checkbox.checked = false;
      });
    });
  });


/***********************************************************************
            submit button
************************************************************************/

  document.addEventListener("DOMContentLoaded", function() {
    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', function() {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(function(checkbox) {
        checkbox.checked = false;
      });
    });
  
    const submitButton = document.getElementById('submit-button');
    submitButton.addEventListener('click', function() {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
      const selectedOptions = [];
      checkboxes.forEach(function(checkbox) {
        const questionNumber = checkbox.name.substring(1, checkbox.name.indexOf('_'));
        selectedOptions.push(`Question ${questionNumber}: ${checkbox.parentNode.textContent.trim()}`);
      });
  
      // Get the selected series number
      const seriesSelect = document.getElementById('serieSelect');
      const selectedSeries = seriesSelect.options[seriesSelect.selectedIndex].value;
  
      const queryParams = new URLSearchParams();
      selectedOptions.forEach(option => {
        const [question, answer] = option.split(': ');
        queryParams.append(question, answer);
      });
      queryParams.append('selectedOptions', selectedOptions.join(','));
      queryParams.append('selectedSeries', selectedSeries); // Append selected series number
      window.location.href = `results.html?${queryParams.toString()}`;
    });
  });
  
  
/***********************************************************************
            Result page
************************************************************************/

document.addEventListener("DOMContentLoaded", function() {
  const resultsContainer = document.getElementById('results-container');
  const existingQuestions = {}; // Object to store existing questions
  let errorCount = 0; // Counter for errors
  const counterSpan = document.getElementById('counter'); // Get the counter span element
  const note = document.getElementById('note'); // Get the counter span element
  const denominator  = document.getElementById('denominator'); // Get the denominator
  const missing = document.getElementById('missing'); // Get the counter missing element
  const queryParams = new URLSearchParams(window.location.search);
  let selectedSeries = '';

  // Extract selected series number from query parameters
  if (queryParams.has('selectedSeries')) {
    selectedSeries = queryParams.get('selectedSeries');
    const title = document.querySelector('h4');
    title.textContent = `Serie: ${selectedSeries}`;
    // Create a span element for the error count
    const errorCountSpan = document.createElement('span');
    errorCountSpan.id = 'error-count';
    title.appendChild(errorCountSpan);
  }

  queryParams.forEach((value, key) => {
    if (key !== 'selectedOptions' && key !== 'selectedSeries') {
      const questionNumber = key.substring(0); // Corrected to start from index 1
      const selectedAnswers = value.split(' - ').join('-'); // Convert hyphen-separated answers to hyphen-separated

      // Check if paragraph for this question number already exists
      if (existingQuestions[questionNumber]) {
        // Append the selected answer to the existing paragraph
        existingQuestions[questionNumber].innerHTML += `-${selectedAnswers}`;
      } else {
        // Create a new list item for the question and its selected answers
        const listItem = document.createElement('li');
        listItem.innerHTML = `${questionNumber} ==> ${selectedAnswers}`;
        listItem.classList.add('styled-li');
        resultsContainer.appendChild(listItem);

        // Add click event listener to each list item
        listItem.addEventListener('click', function() {
          if (listItem.classList.contains('styled-li-red')) {
            listItem.classList.remove('styled-li-red');
            listItem.classList.add('styled-li-black');
          } else {
            listItem.classList.remove('styled-li-black');
            listItem.classList.add('styled-li-red');
          }

          // Update the counter
        errorCount = document.querySelectorAll('.styled-li-red').length;
        counterSpan.textContent = errorCount;
        missing.textContent = 40 - resultsContainer.querySelectorAll('li').length;
        note.textContent = 40-parseInt(missing.textContent) - errorCount;
        denominator.textContent = resultsContainer.querySelectorAll('li').length;

        

        });
        // Store this list item in the existingQuestions object
        existingQuestions[questionNumber] = listItem;
      }
    }
  });
  // Initial update of error count, note, and missing values
  errorCount = document.querySelectorAll('.styled-li-red').length;
  counterSpan.textContent = errorCount;
  missing.textContent = 40 - resultsContainer.querySelectorAll('li').length;
  note.textContent = 40-parseInt(missing.textContent) - errorCount ;
  denominator.textContent = resultsContainer.querySelectorAll('li').length;





  document.getElementById('saveButton').addEventListener('click', function() {
    // Retrieve existing saved data from localStorage
    let savedData = JSON.parse(localStorage.getItem('savedResults'));

    // If no saved data exists or the retrieved data is not an array, initialize it as an empty array
    if (!Array.isArray(savedData)) {
        savedData = [];
    }

    // Gather necessary data for the current save operation
    const currentSave = {
        seriesNumber: selectedSeries, // Assuming selectedSeries is defined
        errorCount: document.querySelectorAll('.styled-li-red').length,
        denominator: resultsContainer.querySelectorAll('li').length,
        questionsWithErrors: [] // Array to store question numbers with errors
    };

    // Iterate through existing questions
    for (const questionNumber in existingQuestions) {
        const question = existingQuestions[questionNumber];
        const isRed = question.classList.contains('styled-li-red');

        if (isRed) {
            currentSave.questionsWithErrors.push(questionNumber);
        }
    }

    // Append the current save data to the existing saved data
    savedData.push(currentSave);

    // Store updated data in localStorage
    localStorage.setItem('savedResults', JSON.stringify(savedData));

    // Redirect to history.html
    window.location.href = 'history.html';
});


});


/***********************************************************************
            History page
************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  // Retrieve saved data from localStorage
  const savedData = JSON.parse(localStorage.getItem('savedResults'));

  if (savedData && savedData.length > 0) {
      // Reverse the order of savedData array to display latest result first
      savedData.reverse();

      // Display saved results
      const savedResultsContainer = document.getElementById('savedResultsContainer');
      savedResultsContainer.innerHTML = savedData.map(savedItem => `
          <div>
            <div class="container-result-tilte">
              <h4>Serie: ${savedItem.seriesNumber}</h4>
                <p class="error-message"><span id="note">${savedItem.denominator-savedItem.errorCount}</span>/<span id="denominator">${savedItem.denominator}</span></p>
                <p class="error-message">errors: <span id="counter">${savedItem.errorCount}</span></p>
                <p class="error-message">missing: <span id="missing">${40-savedItem.denominator}</span></p>
            </div>
            <p class="dropdown-button" >Click to see the errors  &#9660;</p>
            <ul class="dropdown-content">
                ${savedItem.questionsWithErrors.map(questionNumber => `<li>${questionNumber}</li>`).join('')}
            </ul>
          </div>


          
          <hr>
      `).join('');
      // Add event listeners to dropdown buttons
      const dropdownButtons = document.querySelectorAll('.dropdown-button');
      dropdownButtons.forEach(button => {
          button.addEventListener('click', function() {
              const dropdownContent = this.nextElementSibling;
              dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
          });
      });


  } else {
    savedResultsContainer.innerHTML = '<p>No saved results</p>';
  }

  // Add event listener to delete button
  document.getElementById('deleteButton').addEventListener('click', function() {
      // Remove saved results from localStorage
      localStorage.removeItem('savedResults');

      // Clear saved results container
      const savedResultsContainer = document.getElementById('savedResultsContainer');
      savedResultsContainer.innerHTML = '<p>No saved results</p>';
  });
});


/***********************************************************************
            contact page
************************************************************************/


document.addEventListener('DOMContentLoaded', function() {
  const copyLinks = document.querySelectorAll('.copy-link');
  const copyPhones = document.querySelectorAll('.copy-phone');
  const copyEmails = document.querySelectorAll('.copy-email');

  copyLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default link behavior
      copyToClipboard(this.getAttribute('href'));
    });
  });

  copyPhones.forEach(phone => {
    phone.addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default link behavior
      copyToClipboard(this.getAttribute('href').replace('tel:', ''));
    });
  });

  copyEmails.forEach(email => {
    email.addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default link behavior
      copyToClipboard(this.getAttribute('href').replace('mailto:', ''));
    });
  });

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showAlert('Copied to clipboard');
      })
      .catch(error => {
        showAlert('Failed to copy to clipboard');
        console.error('Error copying to clipboard:', error);
      });
  }

  function showAlert(message) {
    // Create and style the alert div
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert');
    alertDiv.textContent = message;
  
    // Append the alert div to the top of the body
    document.body.insertBefore(alertDiv, document.body.firstChild);
  
    // Automatically hide the alert after 2 seconds
    setTimeout(() => {
      alertDiv.style.display = 'none';
    }, 2000);
  }
  
  

  
  
  
});

