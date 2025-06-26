var exerciseData, selectedLeft, selectedRight, matches, isShowingAnswers;
window.onload = onPageLoad();

function onPageLoad() {
    document.getElementById("button").disabled = false;
    var reloadButton = document.getElementById("reloadPage");
    reloadButton.addEventListener("click", clearForm);
    
    // Hide keyboard buttons for this exercise type
    document.getElementById("reset-keyboard").style.display = "none";
    document.getElementById("activate-keyboard").style.display = "none";
    
    var exerciceBody = document.getElementById("exercice-wrapper");
    
    // Exercise data - pairs to match
    exerciseData = [
        { left: "le chat", right: "kot", id: 1 },
        { left: "le chien", right: "pies", id: 2 },
        { left: "la maison", right: "dom", id: 3 },
        { left: "l'école", right: "szkoła", id: 4 },
        { left: "le livre", right: "książka", id: 5 },
        { left: "l'ami", right: "przyjaciel", id: 6 },
        { left: "la voiture", right: "samochód", id: 7 },
        { left: "l'eau", right: "woda", id: 8 },
        { left: "le pain", right: "chleb", id: 9 },
        { left: "la famille", right: "rodzina", id: 10 }
    ];
    
    // Initialize state
    selectedLeft = null;
    selectedRight = null;
    matches = new Map();
    isShowingAnswers = false;
    
    // Set up exercise title and instructions
    document.getElementById("premiere-consigne").innerText = "Exercice de correspondance";
    document.getElementById("deuxieme-consigne").innerText = "Cliquez sur un élément de chaque colonne pour les associer";
    document.getElementById("footer-cat-info").innerText = "Vocabulaire français-polonais";
    
    // Add custom styles for matching exercise
    addMatchingStyles();
    
    // Create the exercise structure
    var myForm = document.createElement("div");
    myForm.setAttribute("id", "myExercice");
    
    // Create container for the matching exercise
    var matchingContainer = document.createElement("div");
    matchingContainer.className = "matching-container";
    matchingContainer.setAttribute("id", "matchingContainer");
    
    // Add SVG for connection lines
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "connections-svg");
    svg.setAttribute("id", "connectionsSvg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    matchingContainer.appendChild(svg);
    
    // Create left column
    var leftColumn = document.createElement("div");
    leftColumn.className = "column";
    leftColumn.setAttribute("id", "leftColumn");
    
    var leftHeader = document.createElement("h3");
    leftHeader.textContent = "Français";
    leftColumn.appendChild(leftHeader);
    
    // Create right column
    var rightColumn = document.createElement("div");
    rightColumn.className = "column";
    rightColumn.setAttribute("id", "rightColumn");
    
    var rightHeader = document.createElement("h3");
    rightHeader.textContent = "Polonais";
    rightColumn.appendChild(rightHeader);
    
    matchingContainer.appendChild(leftColumn);
    matchingContainer.appendChild(rightColumn);
    myForm.appendChild(matchingContainer);
    
    exerciceBody.appendChild(myForm);
    
    // Initialize the matching items
    initializeMatchingItems();
    
    // Set up check button functionality
    document.getElementById("button").onclick = checkAnswers;
    
    // Update button text if needed
    var checkButton = document.getElementById("button");
    if (checkButton.textContent === "Sprawdź") {
        // Keep Polish text
    }
}

function addMatchingStyles() {
    var style = document.createElement('style');
    style.textContent = `
        .matching-container {
            display: flex;
            justify-content: space-around;
            gap: 40px;
            margin: 20px 0;
            position: relative;
            min-height: 400px;
        }
        
        .column {
            flex: 1;
            max-width: 300px;
            z-index: 2;
        }
        
        .column h3 {
            text-align: center;
            margin-bottom: 20px;
            color: #6c5b7c;
            font-size: 20px;
        }
        
        .match-item {
            background-color: #f0f0f0;
            border: 2px solid #d0d0d0;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            font-size: 16px;
            text-align: center;
        }
        
        .match-item:hover {
            background-color: #e0e0e0;
            transform: translateX(5px);
        }
        
        .match-item.selected {
            background-color: #b3a6c9;
            border-color: #6c5b7c;
            color: white;
        }
        
        .match-item.matched {
            background-color: #d0d0d0;
            cursor: default;
            opacity: 0.8;
        }
        
        .match-item.correct {
            background-color: #90d490;
            border-color: #5a9e5a;
        }
        
        .match-item.incorrect {
            background-color: #ff9999;
            border-color: #cc6666;
            animation: shake 0.5s;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .connections-svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: visible;
        }
        
        .connection-line {
            stroke: #6c5b7c;
            stroke-width: 3;
            fill: none;
            opacity: 0.7;
        }
        
        .connection-line.correct {
            stroke: #5a9e5a;
        }
        
        .connection-line.incorrect {
            stroke: #cc6666;
        }
        
        @media (max-width: 768px) {
            .matching-container {
                flex-direction: column;
                gap: 20px;
            }
            
            .column {
                max-width: 100%;
            }
            
            .connections-svg {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);
}

function shuffle(array) {
    var newArray = [...array];
    for (var i = newArray.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = newArray[i];
        newArray[i] = newArray[j];
        newArray[j] = temp;
    }
    return newArray;
}

function initializeMatchingItems() {
    var leftColumn = document.getElementById('leftColumn');
    var rightColumn = document.getElementById('rightColumn');
    
    // Keep headers and clear the rest
    while (leftColumn.children.length > 1) {
        leftColumn.removeChild(leftColumn.lastChild);
    }
    while (rightColumn.children.length > 1) {
        rightColumn.removeChild(rightColumn.lastChild);
    }
    
    // Create arrays of items
    var leftItems = exerciseData.map(function(item) {
        return { text: item.left, id: item.id };
    });
    
    var rightItems = shuffle(exerciseData.map(function(item) {
        return { text: item.right, id: item.id };
    }));
    
    // Create left column items
    leftItems.forEach(function(item) {
        var div = document.createElement('div');
        div.className = 'match-item left-item';
        div.textContent = item.text;
        div.dataset.id = item.id;
        div.onclick = function() {
            selectItem('left', div);
        };
        leftColumn.appendChild(div);
    });
    
    // Create right column items
    rightItems.forEach(function(item) {
        var div = document.createElement('div');
        div.className = 'match-item right-item';
        div.textContent = item.text;
        div.dataset.id = item.id;
        div.onclick = function() {
            selectItem('right', div);
        };
        rightColumn.appendChild(div);
    });
}

function selectItem(side, element) {
    if (element.classList.contains('matched') || isShowingAnswers) return;
    
    if (side === 'left') {
        // Deselect previous left selection
        if (selectedLeft) {
            selectedLeft.classList.remove('selected');
        }
        selectedLeft = element;
        element.classList.add('selected');
    } else {
        // Deselect previous right selection
        if (selectedRight) {
            selectedRight.classList.remove('selected');
        }
        selectedRight = element;
        element.classList.add('selected');
    }
    
    // Check if both sides are selected
    if (selectedLeft && selectedRight) {
        createMatch();
    }
}

function createMatch() {
    var leftId = selectedLeft.dataset.id;
    var rightId = selectedRight.dataset.id;
    
    matches.set(leftId, rightId);
    
    selectedLeft.classList.remove('selected');
    selectedRight.classList.remove('selected');
    selectedLeft.classList.add('matched');
    selectedRight.classList.add('matched');
    
    drawConnection(selectedLeft, selectedRight);
    
    selectedLeft = null;
    selectedRight = null;
}

function drawConnection(leftElement, rightElement, isCorrect) {
    var svg = document.getElementById('connectionsSvg');
    var container = document.getElementById('matchingContainer');
    
    if (!svg || !container) return;
    
    // Get positions relative to the container
    var leftRect = leftElement.getBoundingClientRect();
    var rightRect = rightElement.getBoundingClientRect();
    var containerRect = container.getBoundingClientRect();
    
    // Calculate connection points
    var x1 = leftRect.right - containerRect.left - 5; // Slightly inside the box
    var y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
    var x2 = rightRect.left - containerRect.left + 5; // Slightly inside the box
    var y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
    
    // Create path instead of line for better visibility
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Create a curved path
    var midX = (x1 + x2) / 2;
    var d = 'M ' + x1 + ' ' + y1 + ' Q ' + midX + ' ' + y1 + ' ' + midX + ' ' + ((y1 + y2) / 2) + ' T ' + x2 + ' ' + y2;
    
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#6c5b7c');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('opacity', '0.7');
    
    if (isCorrect !== undefined) {
        path.setAttribute('stroke', isCorrect ? '#5a9e5a' : '#cc6666');
    }
    
    path.dataset.leftId = leftElement.dataset.id;
    
    svg.appendChild(path);
}

function clearConnections() {
    var svg = document.getElementById('connectionsSvg');
    if (svg) {
        svg.innerHTML = '';
    }
}

function checkAnswers() {
    var correct = 0;
    var total = exerciseData.length;
    
    clearConnections();
    
    // Reset visual states
    document.querySelectorAll('.match-item').forEach(function(item) {
        item.classList.remove('correct', 'incorrect');
    });
    
    // Check each match
    matches.forEach(function(rightId, leftId) {
        var leftElement = document.querySelector('.left-item[data-id="' + leftId + '"]');
        var rightElement = document.querySelector('.right-item[data-id="' + rightId + '"]');
        
        if (!leftElement || !rightElement) return;
        
        var isCorrect = leftId === rightId;
        if (isCorrect) {
            correct++;
            leftElement.classList.add('correct');
            rightElement.classList.add('correct');
        } else {
            leftElement.classList.add('incorrect');
            rightElement.classList.add('incorrect');
        }
        
        drawConnection(leftElement, rightElement, isCorrect);
    });
    
    // Show result
    var resultWrapper = document.getElementById("result-wrapper");
    var percentageCorrect = Math.round((correct / total) * 100);
    
    resultWrapper.innerText = "Ton résultat : " + correct + " / " + total + " (" + percentageCorrect + "%)";
    resultWrapper.setAttribute("style", "font-size: larger; color: dark-blue; text-shadow: 0px 0px 3px white;");
    
    // Check if all items were matched
    var unmatchedItems = total - matches.size;
    if (unmatchedItems > 0) {
        resultWrapper.innerText += "\n" + unmatchedItems + " éléments non associés";
    }
}

function showCorrectAnswers() {
    isShowingAnswers = true;
    clearConnections();
    matches.clear();
    
    // Reset all items
    document.querySelectorAll('.match-item').forEach(function(item) {
        item.classList.remove('selected', 'matched', 'correct', 'incorrect');
        item.classList.add('matched', 'correct');
    });
    
    // Show all correct connections
    exerciseData.forEach(function(pair) {
        var leftElement = document.querySelector('.left-item[data-id="' + pair.id + '"]');
        var rightElement = document.querySelector('.right-item[data-id="' + pair.id + '"]');
        
        if (leftElement && rightElement) {
            drawConnection(leftElement, rightElement, true);
        }
    });
    
    var resultWrapper = document.getElementById("result-wrapper");
    resultWrapper.innerText = "Voici les bonnes réponses";
    resultWrapper.setAttribute("style", "font-size: larger; color: green; text-shadow: 0px 0px 3px white;");
}

function clearForm() {
    // Reset state
    selectedLeft = null;
    selectedRight = null;
    matches.clear();
    isShowingAnswers = false;
    
    // Clear connections
    clearConnections();
    
    // Clear result
    document.getElementById("result-wrapper").innerText = "";
    
    // Reset all visual states
    document.querySelectorAll('.match-item').forEach(function(item) {
        item.classList.remove('selected', 'matched', 'correct', 'incorrect');
    });
}

// Optional: Add hint functionality
var hintCount = 0;
function showHint() {
    if (isShowingAnswers || hintCount >= exerciseData.length) return;
    
    // Find an unmatched pair
    var unmatched = exerciseData.find(function(pair) {
        return !matches.has(pair.id.toString());
    });
    
    if (unmatched) {
        var leftElement = document.querySelector('.left-item[data-id="' + unmatched.id + '"]');
        var rightElement = document.querySelector('.right-item[data-id="' + unmatched.id + '"]');
        
        if (leftElement && rightElement) {
            // Highlight the pair briefly
            leftElement.style.backgroundColor = '#ffeb3b';
            rightElement.style.backgroundColor = '#ffeb3b';
            
            setTimeout(function() {
                leftElement.style.backgroundColor = '';
                rightElement.style.backgroundColor = '';
            }, 2000);
            
            hintCount++;
        }
    }
}

// Add window resize handler to redraw connections
window.addEventListener('resize', function() {
    if (matches.size > 0 || isShowingAnswers) {
        var tempMatches = new Map(matches);
        clearConnections();
        
        if (isShowingAnswers) {
            exerciseData.forEach(function(pair) {
                var leftElement = document.querySelector('.left-item[data-id="' + pair.id + '"]');
                var rightElement = document.querySelector('.right-item[data-id="' + pair.id + '"]');
                if (leftElement && rightElement) {
                    drawConnection(leftElement, rightElement, true);
                }
            });
        } else {
            tempMatches.forEach(function(rightId, leftId) {
                var leftElement = document.querySelector('.left-item[data-id="' + leftId + '"]');
                var rightElement = document.querySelector('.right-item[data-id="' + rightId + '"]');
                if (leftElement && rightElement) {
                    var isCorrect = leftId === rightId;
                    drawConnection(leftElement, rightElement, document.querySelector('.match-item.correct') ? isCorrect : undefined);
                }
            });
        }
    }
});