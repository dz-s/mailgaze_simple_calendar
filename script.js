let currentDate = new Date();
let events = [];

// Replace fetch with direct data
const calendarData = {
    "events": [
        {
            "id": 1,
            "start": "2025-03-10 18:00",
            "end": "2025-03-10 20:00",
            "title": "Государь – книга диктаторов",
            "people": ["Никколо Макиавелли", "Ханс Фрайер"],
            "location": "Библиотека, конференц-зал",
            "locationLink": "https://maps.google.com/?q=Library+Conference+Hall+Moscow",
            "description": "Обсуждение Макиавелли и его трудов, таких как\n'Государь' и 'Рассуждения', а также взглядов\nХанса Фрайера на его роль в истории.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Portrait_of_Niccol%C3%B2_Machiavelli_by_Santi_di_Tito.jpg/800px-Portrait_of_Niccol%C3%B2_Machiavelli_by_Santi_di_Tito.jpg"
        },
        {
            "id": 2,
            "start": "2025-03-15 17:30",
            "end": "2025-03-15 19:30",
            "title": "Усталость",
            "people": ["Бён Чхоль Хан", "Петер Хандке"],
            "location": "Коворкинг-пространство",
            "locationLink": "https://maps.google.com/?q=Coworking+Space+Moscow",
            "description": "Поп-психология, селф-хелп и продуктивность.\nОбсуждение работ Бён Чхоль Хана и Петера\nХандке, их взглядов на общество и усталость.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Byung-Chul_Han_%282012%29.jpg/800px-Byung-Chul_Han_%282012%29.jpg"
        },
        {
            "id": 3,
            "start": "2025-03-20 18:00",
            "end": "2025-03-20 20:00",
            "title": "(Во)время",
            "people": ["Мартин Хайдеггер", "Уильям Джеймс"],
            "location": "Философский клуб",
            "locationLink": "https://maps.google.com/?q=Philosophy+Club+Moscow",
            "description": "Как менялось понимание времени в философии.\nЭкзистенциальные идеи Хайдеггера, Уильяма\nДжеймса и других мыслителей о времени.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Martin_Heidegger.jpg/800px-Martin_Heidegger.jpg"
        },
        {
            "id": 4,
            "start": "2025-03-25 19:00",
            "end": "2025-03-25 21:00",
            "title": "Фемтех: авангардное видение слияния женщины и машины",
            "people": ["Ханна Хёх", "Giannina Censi"],
            "location": "Галерея современного искусства",
            "locationLink": "https://maps.google.com/?q=Modern+Art+Gallery+Moscow",
            "description": "Наука, гендер и технологии XX века. Фемтеория,\nконструктивизм и их влияние на искусство:\nработы Ханны Хёх, Giannina Censi и других.",
            "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Hannah_H%C3%B6ch.jpg/800px-Hannah_H%C3%B6ch.jpg"
        }
    ]
};

// Replace fetchEvents function with this simpler version
function fetchEvents() {
    events = calendarData.events;
    renderCalendar();
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
            eventDiv.textContent = event.title;
            
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

// Initialize calendar
fetchEvents(); 