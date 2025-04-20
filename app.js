// Card Swipe Application
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const cardContainer = document.getElementById('card-container');
  const swipeLeftOverlay = document.getElementById('swipe-left');
  const swipeRightOverlay = document.getElementById('swipe-right');
  
  // App State
  let cards = [];
  let currentCardIndex = 0;
  let currentCard = null;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  
  // Touch/Mouse positions
  let initialPosition = { x: 0, y: 0 };
  let currentPosition = { x: 0, y: 0 };
  
  // Constants
  const SWIPE_THRESHOLD = 100; // Minimum distance to consider a swipe
  const ROTATION_ANGLE = 0.2; // Rotation angle multiplier
  
  // Fetch cards data
  fetch('cards.json')
    .then(response => response.json())
    .then(data => {
      cards = data.cards;
      shuffleCards();
      renderNextCard();
    })
    .catch(error => console.error('Error loading cards:', error));
  
  // Shuffle cards using Fisher-Yates algorithm
  function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }
  
  // Create and render a new card
  function renderNextCard() {
    if (currentCardIndex >= cards.length) {
      // Reshuffle when we've gone through all cards
      shuffleCards();
      currentCardIndex = 0;
    }
    
    const cardData = cards[currentCardIndex];
    
    // Create card element
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-color', cardData.color);
    card.style.zIndex = 1;
    
    // Create card content
    const cardText = document.createElement('div');
    cardText.className = 'card-text';
    cardText.textContent = cardData.text;
    
    // Create card indicator (colored dot)
    const cardIndicator = document.createElement('div');
    cardIndicator.className = 'card-indicator';
    
    // Create card footer
    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';
    cardFooter.textContent = 'We Should Talk';
    
    // Append elements to card
    card.appendChild(cardText);
    card.appendChild(cardFooter);
    card.appendChild(cardIndicator);
    
    // Add card to container
    cardContainer.appendChild(card);
    
    // Set as current card
    currentCard = card;
    
    // Add event listeners for dragging
    addCardEventListeners(card);
    
    // Prepare next card index
    currentCardIndex++;
  }
  
  // Add event listeners for card dragging
  function addCardEventListeners(card) {
    // Mouse events
    card.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events
    card.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('touchmove', drag, { passive: true });
    document.addEventListener('touchend', endDrag);
  }
  
  // Start dragging the card
  function startDrag(event) {
    if (!currentCard) return;
    
    isDragging = true;
    
    // Get initial position
    if (event.type.includes('mouse')) {
      initialPosition.x = event.clientX;
      initialPosition.y = event.clientY;
    } else {
      initialPosition.x = event.touches[0].clientX;
      initialPosition.y = event.touches[0].clientY;
    }
    
    // Reset current position
    currentPosition.x = initialPosition.x;
    currentPosition.y = initialPosition.y;
    
    // Add grabbing cursor
    currentCard.style.cursor = 'grabbing';
  }
  
  // Drag the card
  function drag(event) {
    if (!isDragging || !currentCard) return;
    
    // Get current position
    if (event.type.includes('mouse')) {
      currentPosition.x = event.clientX;
      currentPosition.y = event.clientY;
    } else {
      currentPosition.x = event.touches[0].clientX;
      currentPosition.y = event.touches[0].clientY;
    }
    
    // Calculate distance moved
    const deltaX = currentPosition.x - initialPosition.x;
    const deltaY = currentPosition.y - initialPosition.y;
    
    // Move the card
    currentCard.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * ROTATION_ANGLE}deg)`;
    
    // Show appropriate overlay based on swipe direction
    if (deltaX > 50) {
      swipeRightOverlay.style.opacity = Math.min(deltaX / SWIPE_THRESHOLD, 1);
      swipeLeftOverlay.style.opacity = 0;
    } else if (deltaX < -50) {
      swipeLeftOverlay.style.opacity = Math.min(Math.abs(deltaX) / SWIPE_THRESHOLD, 1);
      swipeRightOverlay.style.opacity = 0;
    } else {
      swipeLeftOverlay.style.opacity = 0;
      swipeRightOverlay.style.opacity = 0;
    }
  }
  
  // End dragging the card
  function endDrag() {
    if (!isDragging || !currentCard) return;
    
    isDragging = false;
    
    // Calculate distance moved
    const deltaX = currentPosition.x - initialPosition.x;
    
    // Check if swipe threshold was met
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      // Swipe animation
      const direction = deltaX > 0 ? 1 : -1;
      currentCard.style.transform = `translate(${direction * window.innerWidth}px, ${currentPosition.y - initialPosition.y}px) rotate(${direction * 30}deg)`;
      currentCard.style.opacity = 0;
      
      // Remove card after animation
      setTimeout(() => {
        if (currentCard && currentCard.parentNode) {
          currentCard.parentNode.removeChild(currentCard);
        }
        currentCard = null;
        
        // Reset overlays
        swipeLeftOverlay.style.opacity = 0;
        swipeRightOverlay.style.opacity = 0;
        
        // Render next card
        renderNextCard();
      }, 300);
    } else {
      // Reset card position if not swiped far enough
      currentCard.style.transform = 'translate(0, 0) rotate(0)';
      
      // Reset overlays
      swipeLeftOverlay.style.opacity = 0;
      swipeRightOverlay.style.opacity = 0;
    }
    
    // Reset cursor
    if (currentCard) {
      currentCard.style.cursor = 'grab';
    }
  }
  
  // Add keyboard controls for accessibility
  document.addEventListener('keydown', (event) => {
    if (!currentCard) return;
    
    if (event.key === 'ArrowLeft') {
      // Simulate left swipe
      currentCard.style.transform = `translate(-${window.innerWidth}px, 0) rotate(-30deg)`;
      currentCard.style.opacity = 0;
      swipeLeftOverlay.style.opacity = 1;
      
      setTimeout(() => {
        if (currentCard && currentCard.parentNode) {
          currentCard.parentNode.removeChild(currentCard);
        }
        currentCard = null;
        swipeLeftOverlay.style.opacity = 0;
        renderNextCard();
      }, 300);
    } else if (event.key === 'ArrowRight') {
      // Simulate right swipe
      currentCard.style.transform = `translate(${window.innerWidth}px, 0) rotate(30deg)`;
      currentCard.style.opacity = 0;
      swipeRightOverlay.style.opacity = 1;
      
      setTimeout(() => {
        if (currentCard && currentCard.parentNode) {
          currentCard.parentNode.removeChild(currentCard);
        }
        currentCard = null;
        swipeRightOverlay.style.opacity = 0;
        renderNextCard();
      }, 300);
    }
  });
});
