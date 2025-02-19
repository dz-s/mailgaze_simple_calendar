const RELEASE_NUMBER = "v1.1.0"; // Release number

let currentDate = new Date();
let events = [];
let eventParticipants = {};
let currentIndex = 0;  // Add this global variable

const colorThemes = {
    light: {
        textColor: 'black', // White text for dark backgrounds
        titleColor: '#d04848', // White title for dark backgrounds
    },
    dark: {
        textColor: '#000000', // Black text for light backgrounds
        titleColor: '#d04848', // Black title for light backgrounds
    }
};

// Replace fetch with direct data
const calendarData = {
    "events": [
        {
            "id": 1,
            "start": "2025-02-22 12:00",
            "end": "2025-02-22 15:00",
            "title": "(Во)Время",
            "people": ["Мартин Хайдеггер", "Уильям Джеймс", "Альберт Эйнштейн"],
            "location": "???",
            "locationLink": "none",
            "description": "На данной встрече я предлагаю поговорить о том, как воспринималась и как менялось понимание такой категории нашей жизни как время. Перечислим ключевые изменения в понимании времени, а также чуть более подробно коснемся экзистенциальной мыcли в этом контексте: различия времени/временности, восприятие и проживание",
            "image": "https://cdn.midjourney.com/48c2157e-af25-46b4-8cd2-1c2b51a6cd45/0_0.png",
            "backgroundImage": "https://cdn.midjourney.com/48c2157e-af25-46b4-8cd2-1c2b51a6cd45/0_0.png",
            "tags": ["философия", "время", "экзистенциализм", "физика"],
            "references": [
              "Хайдеггер М. Бытие и время. — М.: Ad Marginem, 1997",
              "James, William. The Principles of Psychology. Dover Publications, 1950",
              "Einstein, Albert. Relativity: The Special and General Theory. Crown Publishers, 1961"
            ]
        },
        {
          "id": 2,
          "start": "2025-03-08 12:00",
          "end": "2025-03-08 15:00",
          "title": "Фемтех: слияние женщины и машины",
          "people": ["Ханна Хёх", "Giannina Censi"],
          "location": "???",
          "locationLink": null,
          "description": "Наука, гендер и технологии XX века. Фемтеория,\nконструктивизм и их влияние на искусство:\nработы Ханны Хёх, Giannina Censi и других.",
          "image": "https://i.pinimg.com/736x/74/2f/ed/742fede45a47f1b740228ca48a0393c9.jpg",
          "backgroundImage": "https://i.pinimg.com/736x/74/2f/ed/742fede45a47f1b740228ca48a0393c9.jpg",
          "tags": ["искусство", "технологии", "феминизм", "авангард"],
          "references": [
              "Höch, Hannah. Picture Book. Green Box, 2010",
              "Lista, Giovanni. Futurism & Photography. Merrell Publishers, 2003"
          ]
      } 
    ]
};

// Function to load participants from storage
function loadParticipants() {
    const stored = localStorage.getItem('eventParticipants');
    if (stored) {
        eventParticipants = JSON.parse(stored);
    } else {
        // Initialize with zeros if no stored data
        events.forEach(event => {
            eventParticipants[event.id] = 0;
        });
        saveParticipants();
    }
}

// Function to save participants to storage
function saveParticipants() {
    localStorage.setItem('eventParticipants', JSON.stringify(eventParticipants));
}

// Replace fetchEvents function with this simpler version
function fetchEvents() {
    events = calendarData.events;
    loadParticipants();  // Load stored participants
    renderCalendar();
    initializeMobileView();
    initializeViewToggle();
}

function renderCalendar() {
    const monthYear = document.getElementById('monthYear');
    const calendar = document.getElementById('calendar');
    
    // Set month and year
    monthYear.textContent = currentDate.toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
    });

    // Clear previous calendar
    calendar.innerHTML = '';

    // Get first day of month and total days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Add days from previous month
    const startingDay = firstDay.getDay();
    for (let i = 0; i < startingDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        dayDiv.textContent = prevMonthLastDay.getDate() - (startingDay - i - 1);
        calendar.appendChild(dayDiv);
    }

    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;

        // Add events for this day
        const dayEvents = events.filter(event => {
            // Parse the date string correctly
            const [datePart] = event.start.split(' ');
            const [year, month, date] = datePart.split('-').map(Number);
            
            return date === day && 
                   (month - 1) === currentDate.getMonth() && // Month is 0-based in JS
                   year === currentDate.getFullYear();
        });

        dayEvents.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event';
            eventDiv.dataset.eventId = event.id;  // Add data attribute for easier selection
            eventDiv.innerHTML = `
                ${event.title}
                <span class="participant-count">${eventParticipants[event.id] || 0}</span>
            `;
            
            eventDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleEventDetails(event, eventDiv);
            });
            
            dayDiv.appendChild(eventDiv);
        });

        calendar.appendChild(dayDiv);
    }

    // Add days from next month
    const remainingDays = 42 - (startingDay + lastDay.getDate()); // 42 is 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.textContent = i;
        calendar.appendChild(dayDiv);
    }
}

function createGoogleCalendarUrl(event) {
    // Format dates for Google Calendar
    const startDate = event.start.replace(' ', 'T');
    const endDate = event.end.replace(' ', 'T');
    
    // Create calendar URL with parameters
    const url = new URL('https://www.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', event.title);
    url.searchParams.append('dates', `${startDate}/${endDate}`.replace(/[-:]/g, ''));
    url.searchParams.append('details', `${event.description}\n\nParticipants: ${event.people.join(', ')}`);
    url.searchParams.append('location', event.location);
    
    return url.toString();
}

function toggleEventDetails(event, eventDiv) {
    const existingDetails = eventDiv.querySelector('.event-details');
    const allEvents = document.querySelectorAll('.event.expanded');
    
    // Close any other expanded events first
    allEvents.forEach(el => {
        if (el !== eventDiv) {
            el.classList.remove('expanded');
            const details = el.querySelector('.event-details');
            if (details) {
                details.classList.remove('show');
            }
        }
    });
    
    // If details already exist, just toggle them
    if (existingDetails) {
        eventDiv.classList.toggle('expanded');
        existingDetails.classList.toggle('show');
        return;
    }
    
    // Create details section
    const details = document.createElement('div');
    details.className = 'event-details';
    
    // Format the time
    const [datePart, timePart] = event.start.split(' ');
    const [startHour, startMinute] = timePart.split(':');
    const [endHour, endMinute] = event.end.split(' ')[1].split(':');
    
    const startTime = `${startHour}:${startMinute}`;
    const endTime = `${endHour}:${endMinute}`;
    
    details.innerHTML = `
        <p class="event-time">
            <span class="time-section">
                <span class="event-details-label">Time:</span> ${startTime} - ${endTime}
            </span>
            <span class="event-actions">
                ${event.image ? `<img src="${event.image}" class="event-image" alt="${event.title}">` : ''}
                <a href="${createGoogleCalendarUrl(event)}" target="_blank" class="calendar-link">
                    📅 Add to Calendar
                </a>
                <a href="#" class="plus-button" onclick="event.preventDefault(); event.stopPropagation(); handlePlusClick(${event.id}, event)">
                    +
                </a>
            </span>
        </p>
        <p class="event-location">
            <span class="event-details-label">Location:</span> 
            <a href="${event.locationLink}" target="_blank" class="location-link">
                📍 ${event.location}
            </a>
        </p>
        <p class="event-people"><span class="event-details-label">People:</span> ${event.people.join(', ')}</p>
        <p class="event-description"><span class="event-details-label">Description:</span><br>${event.description}</p>
    `;
    
    eventDiv.appendChild(details);
    eventDiv.classList.add('expanded');
    details.classList.add('show');
}

// Add click handler to close expanded events when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.event')) {
        document.querySelectorAll('.event.expanded').forEach(el => {
            el.classList.remove('expanded');
            const details = el.querySelector('.event-details');
            if (details) {
                details.classList.remove('show');
            }
        });
    }
});

// Event Listeners
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

function initializeMobileView() {
    if (window.innerWidth <= 768) {
        const mobileCards = document.querySelector('.mobile-cards');
        const mobileHeader = document.querySelector('.mobile-header');
        let currentIndex = 0;
        let touchStartX = 0;
        let touchEndX = 0;

        function updateMobileView() {
            const today = new Date();
            const eventsMobile = events.filter(event => new Date(event.start) >= today); // Only future events

            // Ensure currentIndex is within bounds
            if (currentIndex < 0 || currentIndex >= eventsMobile.length) {
                currentIndex = 0; // Reset to the first event if out of bounds
            }

            const event = eventsMobile[currentIndex]; // Get the current event
            const date = new Date(event.start.split(' ')[0]);

            mobileHeader.textContent = date.toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
            });

            mobileCards.innerHTML = eventsMobile.map((evt, index) => `
                <div class="mobile-card ${
                    index === currentIndex ? 'active' :
                    index < currentIndex ? 'prev' : 'next'
                }">
                    <span class="participant-count">${eventParticipants[evt.id] || 0}</span>
                    <img src="${evt.image}" alt="" class="mobile-card-image">
                    <div class="mobile-card-title">${evt.title}</div>
                    <div class="mobile-card-time">${formatEventDate(evt.start)} ${evt.start.split(' ')[1]} - ${evt.end.split(' ')[1]}</div>
                    <div class="mobile-card-location">
                        <a href="${evt.locationLink}" target="_blank" class="location-link">
                            📍 ${evt.location}
                        </a>
                    </div>
                    <div class="mobile-card-description">${evt.description}</div>
                    <div class="calendar-actions">
                        <a href="${createGoogleCalendarUrl(evt)}" target="_blank" class="calendar-link">
                            📅 Add to Calendar
                        </a>
                        <button class="plus-button" id="plusButton-${evt.id}">
                            +
                        </button>
                    </div>
                </div>
            `).join('');

            // Add touch handlers to plus buttons after rendering
            eventsMobile.forEach(evt => {
                const button = document.getElementById(`plusButton-${evt.id}`);
                if (button) {
                    handleTouchButton(button, evt.id);
                }
            });
        }

        // Touch event handlers
        mobileCards.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        mobileCards.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
            const diff = touchEndX - touchStartX;
            const cards = document.querySelectorAll('.mobile-card');
            
            cards.forEach((card, index) => {
                const offset = (index - currentIndex) * 100;
                const dragOffset = diff / mobileCards.offsetWidth * 100;
                card.style.transform = `translateX(${offset + dragOffset}%)`;
            });
        });

        mobileCards.addEventListener('touchend', () => {
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0 && currentIndex > 0) {
                    currentIndex--;
                } else if (diff < 0 && currentIndex < events.length - 1) {
                    currentIndex++;
                }
            }
            updateMobileView();
        });

        updateMobileView();
    }
}

// Handle resize
window.addEventListener('resize', initializeMobileView);

// Initialize calendar
fetchEvents();

// Update handlePlusClick to save changes
function handlePlusClick(eventId, e) {
    e.stopPropagation();
    eventParticipants[eventId] = (eventParticipants[eventId] || 0) + 1;
    
    // Save to storage
    saveParticipants();
    
    // Update all counters for this event
    document.querySelectorAll(`.event[data-event-id="${eventId}"] .participant-count`).forEach(counter => {
        counter.textContent = eventParticipants[eventId];
    });

    // Update mobile card counter
    const mobileCounter = document.querySelector('.mobile-card.active .participant-count');
    if (mobileCounter) {
        mobileCounter.textContent = eventParticipants[eventId];
    }
}

// Add touch event handler function
function handleTouchButton(button, eventId) {
    let touchStartTime;
    let touchEndTime;
    
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartTime = new Date().getTime();
        button.style.transform = 'scale(0.95)';  // Visual feedback
    });

    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchEndTime = new Date().getTime();
        button.style.transform = 'scale(1)';
        
        // Only trigger if it was a quick tap (less than 200ms)
        if (touchEndTime - touchStartTime < 200) {
            handlePlusClick(eventId, e);
        }
    });
}

// Add view toggle functionality
function initializeViewToggle() {
    const calendarView = document.querySelector('.calendar-view');
    const cardsView = document.querySelector('.cards-view');
    const calendarContainer = document.querySelector('.calendar-container');
    const cardsContainer = document.querySelector('.cards-container');

    // Check if elements exist before adding listeners
    if (!calendarView || !cardsView || !calendarContainer || !cardsContainer) {
        console.error('Required elements not found');
        return;
    }

    calendarView.addEventListener('click', () => {
        calendarView.classList.add('active');
        cardsView.classList.remove('active');
        calendarContainer.style.display = 'block';
        cardsContainer.style.display = 'none';
    });

    cardsView.addEventListener('click', () => {
        cardsView.classList.add('active');
        calendarView.classList.remove('active');
        calendarContainer.style.display = 'none';
        cardsContainer.style.display = 'block';
        renderCards('upcoming'); // Default to upcoming events
    });

    // Add tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderCards(button.dataset.tab);
        });
    });

    // Set initial state
    calendarContainer.style.display = 'block';
    cardsContainer.style.display = 'none';
}

function renderCards(tab = 'upcoming') {
    const container = document.querySelector('.cards-content');
    const today = new Date();

    // Create an array for mobile view that only includes future events
    const eventsMobile = events.filter(event => new Date(event.start) >= today);

    // Filter events based on tab
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.start.split(' ')[0]);
        return tab === 'upcoming' ? eventDate >= today : eventDate < today;
    });

    // Sort events
    filteredEvents.sort((a, b) => {
        const dateA = new Date(a.start);
        const dateB = new Date(b.start);
        return tab === 'upcoming' ? dateA - dateB : dateB - dateA;
    });

    // Check if in mobile view
    const isMobileView = window.innerWidth <= 768;

    // Use eventsMobile for rendering in mobile view
    const eventsToRender = isMobileView ? eventsMobile : filteredEvents;

    container.innerHTML = eventsToRender.map(event => {
        const isPastEvent = new Date(event.start) < today; // Check if the event is in the past
        const hasBackgroundImage = event.backgroundImage && event.backgroundImage.trim() !== '';
        
        // Determine the theme based on the background image presence
        const theme = hasBackgroundImage ? colorThemes.light : colorThemes.dark;

        return `
            <div class="event-card ${isPastEvent ? 'past-event' : ''}">
                <div class="background-image" style="background-image: url('${event.backgroundImage || ''}');"></div>
                <div class="event-card-header" style="color: ${theme.textColor};">
                    ${event.image && !hasBackgroundImage ? `<img src="${event.image}" alt="" class="event-card-image ${isPastEvent ? 'past-image' : ''}">` : ''}
                    <div>
                        <h3 class="event-card-title" style="color: ${theme.titleColor}; background-color: ${hasBackgroundImage ? 'white' : 'transparent'}; font-weight: ${hasBackgroundImage ? 'bold' : 'normal'};">${event.title}</h3>
                        <div class="event-card-time" style="color: ${theme.textColor};};">
                            🕑️ ${formatEventDate(event.start)} ${event.start.split(' ')[1]} - ${event.end.split(' ')[1]}
                        </div>
                    </div>
                </div>
                ${event.tags ? `
                    <div class="event-card-tags">
                        ${event.tags.map(tag => `
                            <span class="event-tag">${tag}</span>
                        `).join('')}
                    </div>
                ` : ''}
                <div class="event-card-description" style="color: ${theme.textColor}; font-weight: ${hasBackgroundImage ? 'bold' : 'normal'};">
                    ${marked.parse(event.description)}
                </div>
                ${event.references ? `
                    <div class="event-references">
                        <h4 style="color: ${theme.textColor};">References:</h4>
                        <ul>
                            ${event.references.map(ref => `
                                <li style="color: ${theme.textColor};">${ref}</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div class="calendar-actions" style="display: ${new Date(event.start) >= today ? 'flex' : 'none'};">
                    <a href="${createGoogleCalendarUrl(event)}" target="_blank" class="calendar-link">
                        📅 Add to Calendar
                    </a>
                    <button class="plus-button" onclick="handlePlusClick(${event.id}, event)">
                        +
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Helper function to format date
function formatEventDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Initialize Twemoji
document.addEventListener("DOMContentLoaded", function() {
    twemoji.parse(document.body);
}); 