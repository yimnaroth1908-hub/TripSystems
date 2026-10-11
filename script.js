
"use strict";

// =====================================================
// KOMPOT TRIP PLAN
// Smart Trip Generator - Cambodia
// Connected to Node.js Server
// =====================================================


// =====================================================
// 1. SELECT HTML ELEMENTS
// =====================================================

const $ = (selector) => document.querySelector(selector);

const tripForm = $("#tripForm");
const formMessage = $("#formMessage");
const tripResults = $("#tripResults");
const itineraryContainer = $("#itineraryContainer");
const tripSummary = $("#tripSummary");
const budgetBreakdown = $("#budgetBreakdown");
const budgetTotal = $("#budgetTotal");
const budgetPerPerson = $("#budgetPerPerson");
const savedTripsContainer = $("#savedTripsContainer");
const saveTripButton = $("#saveTripButton");

const resultTitle = $("#resultTitle");
const tripNameInput = $("#tripName");
const startDateInput = $("#startDate");
const travelersInput = $("#travelers");
const durationInput = $("#duration");
const budgetInput = $("#budget");
const transportInput = $("#transport");

const menuToggle = $("#menuToggle");
const navbar = $("#navbar");
const currentYear = $("#currentYear");


// =====================================================
// 2. CONFIGURATION AND STORAGE
// =====================================================

const API_URL = "/api/submissions";
const STORAGE_KEY = "kompotTripPlans";

let currentTrip = null;
let isSubmitting = false;


// =====================================================
// 3. KAMPOT DESTINATIONS AND ACTIVITIES
// =====================================================

const places = {
    nature: [
        {
            name: "ភ្នំបូកគោ",
            type: "ធម្មជាតិ និងទេសភាព",
            time: "08:00 AM",
            duration: "២–៣ ម៉ោង",
            description:
                "គយគន់ទេសភាពភ្នំ និងខ្យល់អាកាសត្រជាក់។ សូមពិនិត្យស្ថានភាពផ្លូវ និងម៉ោងបើកមុនពេលធ្វើដំណើរ។"
        },
        {
            name: "ជនបទកំពត",
            type: "ទេសភាពធម្មជាតិ",
            time: "09:00 AM",
            duration: "១–២ ម៉ោង",
            description:
                "ដើរលេងតាមតំបន់ជនបទ គយគន់វាលស្រែ និងស្វែងយល់ពីជីវភាពរស់នៅរបស់ប្រជាជនក្នុងតំបន់។"
        },
        {
            name: "ចម្ការម្រេចកំពត",
            type: "បទពិសោធន៍ក្នុងតំបន់",
            time: "09:30 AM",
            duration: "១–២ ម៉ោង",
            description:
                "ស្វែងយល់ពីការដាំដុះម្រេចកំពត និងកសិកម្មក្នុងតំបន់។ សូមពិនិត្យម៉ោងទទួលភ្ញៀវ និងតម្លៃចូលជាមុន។"
        }
    ],

    food: [
        {
            name: "អាហារពេលព្រឹកបែបខ្មែរ",
            type: "ម្ហូបអាហារ",
            time: "07:30 AM",
            duration: "៤៥ នាទី",
            description:
                "ចាប់ផ្តើមថ្ងៃថ្មីជាមួយអាហារពេលព្រឹកបែបខ្មែរ នៅហាងក្នុងតំបន់ដែលសមស្របនឹងថវិការបស់អ្នក។"
        },
        {
            name: "ភ្លក់ម្ហូបក្នុងស្រុក",
            type: "ម្ហូបអាហារ",
            time: "12:00 PM",
            duration: "១ ម៉ោង",
            description:
                "សាកល្បងម្ហូបខ្មែរ និងអាហារសមុទ្រក្នុងតំបន់។ សូមពិនិត្យតម្លៃមុខម្ហូបមុនបញ្ជាទិញ។"
        },
        {
            name: "អាហារពេលល្ងាចមាត់ព្រែក",
            type: "អាហារ និងសម្រាក",
            time: "06:00 PM",
            duration: "១–១.៥ ម៉ោង",
            description:
                "ទទួលទានអាហារពេលល្ងាចក្បែរមាត់ព្រែកកំពត និងរីករាយជាមួយបរិយាកាសពេលល្ងាច។"
        }
    ],

    adventure: [
        {
            name: "ដំណើរកម្សាន្តតាមជនបទ",
            type: "ផ្សងព្រេង",
            time: "09:00 AM",
            duration: "២ ម៉ោង",
            description:
                "ស្វែងយល់ពីផ្លូវជនបទ និងកន្លែងទេសភាពស្រស់ស្អាត។ ជ្រើសរើសមធ្យោបាយធ្វើដំណើរដែលមានសុវត្ថិភាព។"
        },
        {
            name: "សកម្មភាពក្បែរមាត់ព្រែក",
            type: "សកម្មភាពក្រៅផ្ទះ",
            time: "03:00 PM",
            duration: "១–២ ម៉ោង",
            description:
                "ស្វែងរកសកម្មភាពកម្សាន្តតាមមាត់ព្រែកដែលមានផ្តល់ជូន និងពិនិត្យតម្លៃ ព្រមទាំងលក្ខខណ្ឌសុវត្ថិភាពជាមុន។"
        }
    ],

    relax: [
        {
            name: "ផឹកកាហ្វេក្បែរមាត់ព្រែក",
            type: "សម្រាកលំហែ",
            time: "08:30 AM",
            duration: "៤៥ នាទី",
            description:
                "ចាប់ផ្តើមថ្ងៃថ្មីដោយផឹកកាហ្វេ និងគយគន់ទេសភាពស្ងប់ស្ងាត់ក្បែរមាត់ព្រែក។"
        },
        {
            name: "ដើរលេងតាមមាត់ព្រែកកំពត",
            type: "សម្រាកលំហែ",
            time: "04:30 PM",
            duration: "៤៥ នាទី",
            description:
                "ដើរលេងស្រាលៗតាមមាត់ព្រែក និងរីករាយជាមួយខ្យល់អាកាសពេលរសៀល។"
        },
        {
            name: "ទស្សនាថ្ងៃលិចនៅមាត់ព្រែក",
            type: "ទេសភាពថ្ងៃលិច",
            time: "05:15 PM",
            duration: "៤៥ នាទី",
            description:
                "ស្វែងរកកន្លែងសាធារណៈសមស្រប ដើម្បីគយគន់ថ្ងៃលិច និងថតរូបអនុស្សាវរីយ៍។"
        }
    ],

    culture: [
        {
            name: "ដើរលេងក្នុងក្រុងកំពត",
            type: "វប្បធម៌",
            time: "09:00 AM",
            duration: "១ ម៉ោង",
            description:
                "ស្វែងយល់ពីទីប្រជុំជន ហាងក្នុងតំបន់ និងស្ថាបត្យកម្មចាស់ៗរបស់ក្រុងកំពត។"
        },
        {
            name: "ទស្សនាផ្សារក្នុងតំបន់",
            type: "វប្បធម៌ក្នុងស្រុក",
            time: "10:30 AM",
            duration: "៤៥ នាទី",
            description:
                "ដើរមើលផលិតផលក្នុងស្រុក អាហារសម្រន់ និងជីវភាពប្រចាំថ្ងៃរបស់ប្រជាជនក្នុងផ្សារ។"
        }
    ],

    photography: [
        {
            name: "កន្លែងថតរូបទេសភាព",
            type: "ថតរូប",
            time: "07:00 AM",
            duration: "៤៥ នាទី",
            description:
                "ថតរូបទេសភាពនៅពេលព្រឹកដែលមានពន្លឺទន់ភ្លន់។ សូមគោរពកម្មសិទ្ធិឯកជន និងបទបញ្ជាក្នុងតំបន់។"
        },
        {
            name: "ថតរូបពេលល្ងាចនៅមាត់ព្រែក",
            type: "ថតរូប",
            time: "04:45 PM",
            duration: "៤៥ នាទី",
            description:
                "ចាប់យករូបភាពទន្លេ និងទេសភាពជុំវិញនៅពេលពន្លឺរសៀលចាប់ផ្តើមស្រទន់។"
        }
    ]
};


const defaultActivities = [
    {
        name: "ស្វែងយល់ពីក្រុងកំពត",
        type: "ដើរលេង",
        time: "09:00 AM",
        duration: "១ ម៉ោង",
        description:
            "ដើរលេងក្នុងក្រុង ស្វែងរកហាងក្នុងតំបន់ និងស្វែងយល់ពីបរិយាកាសកំពត។"
    },
    {
        name: "ពេលវេលាសេរី",
        type: "សម្រាកលំហែ",
        time: "02:00 PM",
        duration: "១ ម៉ោង",
        description:
            "សម្រាក ឬជ្រើសរើសកន្លែងកម្សាន្តនៅក្បែរនោះតាមចំណង់ចំណូលចិត្តរបស់អ្នក។"
    }
];


// =====================================================
// 4. HELPER FUNCTIONS
// =====================================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


function money(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}


function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {
    if (!dateString) {
        return "មិនទាន់កំណត់";
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return escapeHTML(dateString);
    }

    return date.toLocaleDateString("km-KH", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}


function addDays(dateString, days) {
    const date = new Date(`${dateString}T12:00:00`);

    date.setDate(date.getDate() + days);

    return getLocalDateString(date);
}


function getSavedTrips() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        console.error("Cannot read saved trips:", error);
        return [];
    }
}


function setSavedTrips(trips) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(trips)
        );

        return true;
    } catch (error) {
        console.error("Cannot save trips:", error);

        setFormMessage(
            "មិនអាចរក្សាទុកគម្រោងបានទេ។ សូមពិនិត្យ Browser របស់អ្នក។",
            "error"
        );

        return false;
    }
}


function setFormMessage(message, type = "info") {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.hidden = !message;
}


function getSelectedInterests() {
    return Array.from(
        document.querySelectorAll(
            'input[name="interests"]:checked'
        )
    ).map((input) => input.value);
}


function normalizeTransport(transport) {
    const value = String(transport || "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");

    const aliases = {
        "tuk tuk": "tuktuk",
        "tuk-tuk": "tuktuk",
        "motor bike": "motorbike",
        "motor bike taxi": "motorbike",
        "on foot": "walking"
    };

    return aliases[value] || value;
}


function getTransportCost(transport) {
    const costs = {
        walking: 0,
        motorbike: 8,
        tuktuk: 20,
        car: 45,
        bus: 12
    };

    return costs[normalizeTransport(transport)] ?? 15;
}


// =====================================================
// 5. CONNECT TO NODE.JS SERVER
// =====================================================

async function submitTripToServer(trip) {
    let response;

    try {
        response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: "trip-plan",
                clientTripId: trip.id,
                name: trip.name,
                startDate: trip.startDate,
                travelers: trip.travelers,
                duration: trip.duration,
                budget: trip.budget,
                transport: trip.transport,
                interests: trip.interests,
                itinerary: trip.itinerary,
                budgetDetails: trip.budgetDetails
            })
        });
    } catch (error) {
        throw new Error(
            "មិនអាចភ្ជាប់ទៅ Server បានទេ។ សូមពិនិត្យ Node.js Server។"
        );
    }

    let result;

    try {
        result = await response.json();
    } catch (error) {
        throw new Error(
            "Server បានបញ្ជូនទិន្នន័យត្រឡប់មកមិនត្រឹមត្រូវ។"
        );
    }

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "មិនអាចរក្សាទុកទិន្នន័យទៅ Server បានទេ។"
        );
    }

    return result;
}


// =====================================================
// 6. BUDGET CALCULATION
// =====================================================

function calculateBudget(trip) {
    const travelers = Math.max(
        1,
        Number(trip.travelers) || 1
    );

    const duration = Math.max(
        1,
        Number(trip.duration) || 1
    );

    const budgetLevel = trip.budget || "standard";

    const dailyFoodPerPerson = {
        low: 8,
        standard: 15,
        high: 30
    };

    const dailyOtherPerPerson = {
        low: 3,
        standard: 8,
        high: 18
    };

    const accommodationPerPerson = {
        low: 8,
        standard: 20,
        high: 50
    };

    const food =
        (dailyFoodPerPerson[budgetLevel] ?? 15) *
        travelers *
        duration;

    const activities =
        (dailyOtherPerPerson[budgetLevel] ?? 8) *
        travelers *
        duration;

    const transport =
        getTransportCost(trip.transport) * duration;

    const accommodation =
        (accommodationPerPerson[budgetLevel] ?? 20) *
        travelers *
        Math.max(0, duration - 1);

    const total =
        food + activities + transport + accommodation;

    return {
        food,
        activities,
        transport,
        accommodation,
        total,
        perPerson: total / travelers
    };
}


// =====================================================
// 7. CREATE DAILY ACTIVITIES
// =====================================================

function createDayActivities(interests, dayIndex, duration) {
    const activities = [];

    interests.forEach((interest) => {
        if (!places[interest]) return;

        const selectedPlaces = places[interest];

        const activity =
            selectedPlaces[dayIndex % selectedPlaces.length];

        if (activity) {
            activities.push({ ...activity });
        }
    });

    if (activities.length === 0) {
        activities.push(
            ...defaultActivities.map((item) => ({ ...item }))
        );
    }

    if (activities.length < 2) {
        activities.push(
            ...defaultActivities.map((item) => ({ ...item }))
        );
    }

    const maxActivities = duration >= 5 ? 4 : 3;
    const dailyActivities = activities.slice(0, maxActivities);

    if (dayIndex === duration - 1) {
        dailyActivities.push({
            name: "រៀបចំឥវ៉ាន់ និងត្រៀមត្រឡប់",
            type: "បញ្ចប់ដំណើរកម្សាន្ត",
            time: "04:00 PM",
            duration: "៣០ នាទី",
            description:
                "ពិនិត្យឥវ៉ាន់ និងរៀបចំការធ្វើដំណើរត្រឡប់ដោយសុវត្ថិភាព។"
        });
    }

    return dailyActivities;
}


// =====================================================
// 8. BUILD ITINERARY
// =====================================================

function buildItinerary(trip) {
    const itinerary = [];
    const interests = trip.interests || [];

    for (let day = 0; day < trip.duration; day++) {
        const date = addDays(trip.startDate, day);

        itinerary.push({
            day: day + 1,
            date,
            title: `ថ្ងៃទី ${day + 1}`,
            activities: createDayActivities(
                interests,
                day,
                trip.duration
            )
        });
    }

    return itinerary;
}


// =====================================================
// 9. GENERATE TRIP
// =====================================================

function generateTrip(formData) {
    const trip = {
        id: `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`,

        name: formData.name || "ដំណើរកម្សាន្តនៅកំពត",
        startDate: formData.startDate,
        travelers: Number(formData.travelers) || 1,
        duration: Number(formData.duration) || 1,
        budget: formData.budget || "standard",
        transport: formData.transport || "tuk tuk",
        interests: formData.interests || [],
        createdAt: new Date().toISOString()
    };

    trip.itinerary = buildItinerary(trip);
    trip.budgetDetails = calculateBudget(trip);

    return trip;
}


// =====================================================
// 10. RENDER TRIP SUMMARY
// =====================================================

function renderSummary(trip) {
    if (!tripSummary) return;

    const budgetNames = {
        low: "សន្សំសំចៃ",
        standard: "មធ្យម",
        high: "ប្រណីត"
    };

    const transportNames = {
        walking: "ដើរថ្មើរជើង",
        motorbike: "ម៉ូតូ",
        tuktuk: "រ៉ឺម៉កកង់បី",
        "tuk tuk": "រ៉ឺម៉កកង់បី",
        car: "រថយន្ត",
        bus: "ឡានក្រុង"
    };

    const transport =
        normalizeTransport(trip.transport);

    tripSummary.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">📍 ទិសដៅ</span>
            <strong>កំពត ប្រទេសកម្ពុជា</strong>
        </div>

        <div class="summary-item">
            <span class="summary-label">📅 ថ្ងៃចាប់ផ្តើម</span>
            <strong>${formatDate(trip.startDate)}</strong>
        </div>

        <div class="summary-item">
            <span class="summary-label">🌙 រយៈពេល</span>
            <strong>${Number(trip.duration) || 1} ថ្ងៃ</strong>
        </div>

        <div class="summary-item">
            <span class="summary-label">👥 ចំនួនអ្នកធ្វើដំណើរ</span>
            <strong>${Number(trip.travelers) || 1} នាក់</strong>
        </div>

        <div class="summary-item">
            <span class="summary-label">💰 កម្រិតថវិកា</span>
            <strong>${budgetNames[trip.budget] || "មធ្យម"}</strong>
        </div>

        <div class="summary-item">
            <span class="summary-label">🛵 មធ្យោបាយធ្វើដំណើរ</span>
            <strong>${transportNames[transport] || "ផ្សេងៗ"}</strong>
        </div>
    `;
}


// =====================================================
// 11. RENDER BUDGET
// =====================================================

function renderBudget(trip) {
    if (!budgetBreakdown || !budgetTotal || !budgetPerPerson) {
        return;
    }

    const budget =
        trip.budgetDetails || calculateBudget(trip);

    const rows = [
        {
            label: "🍜 អាហារ និងភេសជ្ជៈ",
            amount: budget.food
        },
        {
            label: "🎟️ សកម្មភាព និងកម្សាន្ត",
            amount: budget.activities
        },
        {
            label: "🛵 មធ្យោបាយធ្វើដំណើរ",
            amount: budget.transport
        },
        {
            label: "🏨 កន្លែងស្នាក់នៅ",
            amount: budget.accommodation
        }
    ];

    budgetBreakdown.innerHTML = rows.map((row) => `
        <div class="budget-row">
            <span>${row.label}</span>
            <strong>${money(row.amount)}</strong>
        </div>
    `).join("");

    budgetTotal.textContent = money(budget.total);
    budgetPerPerson.textContent = money(budget.perPerson);
}


// =====================================================
// 12. RENDER ITINERARY
// =====================================================

function renderItinerary(trip) {
    if (!itineraryContainer) return;

    if (
        !Array.isArray(trip.itinerary) ||
        trip.itinerary.length === 0
    ) {
        itineraryContainer.innerHTML =
            "<p>មិនមានកាលវិភាគសម្រាប់បង្ហាញទេ។</p>";

        return;
    }

    itineraryContainer.innerHTML = trip.itinerary.map((day) => `
        <article class="itinerary-day">
            <div class="itinerary-day-header">
                <div>
                    <span class="day-label">ថ្ងៃទី ${day.day}</span>
                    <h3>${escapeHTML(day.title)}</h3>
                </div>

                <span class="day-date">
                    ${formatDate(day.date)}
                </span>
            </div>

            <div class="activity-list">
                ${(day.activities || []).map((activity) => `
                    <div class="activity-item">
                        <div class="activity-time">
                            ${escapeHTML(activity.time)}
                        </div>

                        <div class="activity-content">
                            <h4>${escapeHTML(activity.name)}</h4>

                            <span class="activity-type">
                                ${escapeHTML(activity.type)}
                            </span>

                            <p>
                                ${escapeHTML(activity.description)}
                            </p>

                            <small>
                                ⏱ រយៈពេល៖
                                ${escapeHTML(activity.duration)}
                            </small>
                        </div>
                    </div>
                `).join("")}
            </div>
        </article>
    `).join("");
}


// =====================================================
// 13. RENDER COMPLETE TRIP
// =====================================================

function renderTrip(trip) {
    currentTrip = trip;

    if (resultTitle) {
        resultTitle.innerHTML = `
            គម្រោងដំណើរកម្សាន្ត
            <span>${escapeHTML(trip.name)}</span>
        `;
    }

    renderSummary(trip);
    renderItinerary(trip);
    renderBudget(trip);

    if (tripResults) {
        tripResults.hidden = false;

        tripResults.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    if (saveTripButton) {
        saveTripButton.disabled = false;
        saveTripButton.textContent = "♡ រក្សាទុកគម្រោង";
    }
}


// =====================================================
// 14. RENDER SAVED TRIPS
// =====================================================

function renderSavedTrips() {
    if (!savedTripsContainer) return;

    const trips = getSavedTrips();

    if (trips.length === 0) {
        savedTripsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🧳</div>

                <h3>
                    អ្នកមិនទាន់មានគម្រោងដែលបានរក្សាទុកទេ
                </h3>

                <p>
                    បង្កើតគម្រោងដំណើរកម្សាន្តខាងលើ
                    រួចចុចប៊ូតុងរក្សាទុក។
                </p>
            </div>
        `;

        return;
    }

    savedTripsContainer.innerHTML = trips.map((trip) => `
        <article
            class="saved-trip-card"
            data-trip-id="${escapeHTML(trip.id)}"
        >
            <div class="saved-trip-info">
                <h3>${escapeHTML(trip.name)}</h3>

                <p>📅 ${formatDate(trip.startDate)}</p>

                <p>
                    🌙 ${Number(trip.duration) || 1} ថ្ងៃ
                    · 👥 ${Number(trip.travelers) || 1} នាក់
                </p>

                <p>
                    💰 ${money(
                        trip.budgetDetails?.total ??
                        calculateBudget(trip).total
                    )}
                </p>
            </div>

            <div class="saved-trip-actions">
                <button
                    type="button"
                    class="btn btn-primary view-trip-button"
                    data-action="view"
                    data-id="${escapeHTML(trip.id)}"
                >
                    មើលគម្រោង
                </button>

                <button
                    type="button"
                    class="btn btn-secondary delete-trip-button"
                    data-action="delete"
                    data-id="${escapeHTML(trip.id)}"
                >
                    លុប
                </button>
            </div>
        </article>
    `).join("");
}


// =====================================================
// 15. SAVE CURRENT TRIP LOCALLY
// =====================================================

function saveCurrentTrip() {
    if (!currentTrip) {
        setFormMessage(
            "សូមបង្កើតគម្រោងដំណើរកម្សាន្តជាមុនសិន។",
            "error"
        );

        return;
    }

    const trips = getSavedTrips();

    const alreadySaved = trips.some(
        (trip) => trip.id === currentTrip.id
    );

    if (alreadySaved) {
        setFormMessage(
            "គម្រោងនេះត្រូវបានរក្សាទុករួចហើយ។",
            "info"
        );

        return;
    }

    const updatedTrips = [currentTrip, ...trips];

    if (!setSavedTrips(updatedTrips)) {
        return;
    }

    renderSavedTrips();

    if (saveTripButton) {
        saveTripButton.textContent = "♥ បានរក្សាទុក";
    }

    setFormMessage(
        "រក្សាទុកគម្រោងក្នុង Browser បានជោគជ័យ! ❤️",
        "success"
    );
}


 // =====================================================
 // 16. TRIP FORM SUBMISSION
 // =====================================================

if (tripForm) {
    tripForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (isSubmitting) return;

        setFormMessage("", "info");

        // Get form values
        const name =
            tripNameInput?.value.trim() ||
            "ដំណើរកម្សាន្តនៅកំពត";

        const startDate = startDateInput?.value || "";

        const travelers = Number(travelersInput?.value);

        const duration = Number(durationInput?.value);

        const budget = budgetInput?.value?.trim() || "";

        const transport = transportInput?.value || "";

        const interests = getSelectedInterests();

        // Validate start date
        if (!startDate) {
            setFormMessage(
                "សូមជ្រើសរើសថ្ងៃចាប់ផ្តើមដំណើរកម្សាន្ត។",
                "error"
            );

            startDateInput?.focus();
            return;
        }

        if (startDate < getLocalDateString()) {
            setFormMessage(
                "ថ្ងៃចាប់ផ្តើមមិនអាចជាកាលបរិច្ឆេទកន្លងមកបានទេ។",
                "error"
            );

            startDateInput?.focus();
            return;
        }

        // Validate travelers
        if (
            !Number.isSafeInteger(travelers) ||
            travelers < 1
        ) {
            setFormMessage(
                "សូមជ្រើសរើសចំនួនអ្នកធ្វើដំណើរដែលត្រឹមត្រូវ។",
                "error"
            );

            travelersInput?.focus();
            return;
        }

        // Validate duration
        if (
            !Number.isSafeInteger(duration) ||
            duration < 1 ||
            duration > 30
        ) {
            setFormMessage(
                "រយៈពេលដំណើរកម្សាន្តត្រូវមានចន្លោះពី ១ ដល់ ៣០ ថ្ងៃ។",
                "error"
            );

            durationInput?.focus();
            return;
        }

        // Validate budget
        const validBudgets = [
            "low",
            "standard",
            "high"
        ];

        if (!validBudgets.includes(budget)) {
            setFormMessage(
                "សូមជ្រើសរើសកម្រិតថវិកាដែលត្រឹមត្រូវ។",
                "error"
            );

            budgetInput?.focus();
            return;
        }

        // Validate transportation
        const validTransports = [
            "motorbike",
            "car",
            "bus",
            "bicycle",
            "walking",
            "tuktuk",
            "tuk tuk"
        ];

        if (
            !validTransports.includes(
                normalizeTransport(transport)
            )
        ) {
            setFormMessage(
                "សូមជ្រើសរើសមធ្យោបាយធ្វើដំណើរដែលត្រឹមត្រូវ។",
                "error"
            );

            transportInput?.focus();
            return;
        }

        // Validate interests
        if (interests.length === 0) {
            setFormMessage(
                "សូមជ្រើសរើសចំណង់ចំណូលចិត្តយ៉ាងតិចមួយ។",
                "error"
            );

            return;
        }

        const invalidInterest = interests.some(
            (interest) => !places[interest]
        );

        if (invalidInterest) {
            setFormMessage(
                "ចំណង់ចំណូលចិត្តមិនត្រឹមត្រូវទេ។",
                "error"
            );

            return;
        }

        // Create trip plan
        const trip = generateTrip({
            name,
            startDate,
            travelers,
            duration,
            budget,
            transport,
            interests
        });

        // Display generated itinerary and budget
        renderTrip(trip);

        // Prevent duplicate submissions
        isSubmitting = true;

        const submitButton = tripForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        const originalButtonText = submitButton
            ? submitButton.textContent
            : "";

        if (submitButton) {
            submitButton.disabled = true;

            if (submitButton.tagName === "BUTTON") {
                submitButton.textContent =
                    "កំពុងរក្សាទុក...";
            }
        }

        setFormMessage(
            "កំពុងបញ្ជូនទិន្នន័យទៅ Server...",
            "info"
        );

        try {
            // Send trip to Node.js server
            await submitTripToServer(trip);

            setFormMessage(
                "បង្កើតផែនការដំណើរ និងរក្សាទុកទៅ Server បានជោគជ័យ! 🎉",
                "success"
            );

            console.log(
                "Trip saved successfully:",
                trip.id
            );

        } catch (error) {
            console.error(
                "Submit trip error:",
                error
            );

            setFormMessage(
                "ផែនការដំណើរត្រូវបានបង្កើត ប៉ុន្តែការរក្សាទុកទៅ Server បរាជ័យ។ " +
                (error.message || "សូមពិនិត្យ Node.js Server។"),
                "error"
            );

        } finally {
            isSubmitting = false;

            if (submitButton) {
                submitButton.disabled = false;

                if (submitButton.tagName === "BUTTON") {
                    submitButton.textContent =
                        originalButtonText;
                }
            }
        }
    });
}



// =====================================================
// 17. SAVE BUTTON EVENT
// =====================================================

if (saveTripButton) {
    saveTripButton.addEventListener(
        "click",
        saveCurrentTrip
    );
}


// =====================================================
// 18. VIEW OR DELETE SAVED TRIPS
// =====================================================

if (savedTripsContainer) {
    savedTripsContainer.addEventListener("click", (event) => {
        const button = event.target.closest(
            "button[data-action]"
        );

        if (!button) return;

        const action = button.dataset.action;
        const tripId = button.dataset.id;

        if (!tripId) return;

        const trips = getSavedTrips();

        if (action === "view") {
            const selectedTrip = trips.find(
                (trip) => String(trip.id) === String(tripId)
            );

            if (!selectedTrip) {
                setFormMessage(
                    "រកមិនឃើញគម្រោងនេះទេ។",
                    "error"
                );

                return;
            }

            renderTrip(selectedTrip);

            setFormMessage(
                "កំពុងបង្ហាញគម្រោងដែលអ្នកបានរក្សាទុក។",
                "success"
            );
        }

        if (action === "delete") {
            const confirmed = window.confirm(
                "តើអ្នកពិតជាចង់លុបគម្រោងដំណើរកម្សាន្តនេះមែនទេ?"
            );

            if (!confirmed) return;

            const updatedTrips = trips.filter(
                (trip) => String(trip.id) !== String(tripId)
            );

            if (!setSavedTrips(updatedTrips)) {
                return;
            }

            if (
                currentTrip &&
                String(currentTrip.id) === String(tripId)
            ) {
                currentTrip = null;

                if (saveTripButton) {
                    saveTripButton.textContent = "♡ រក្សាទុកគម្រោង";
                    saveTripButton.disabled = true;
                }
            }

            renderSavedTrips();

            setFormMessage(
                "លុបគម្រោងចេញពី Browser បានជោគជ័យ។",
                "success"
            );
        }
    });
}


// =====================================================
// 19. MOBILE NAVIGATION
// =====================================================

if (menuToggle && navbar) {
    menuToggle.addEventListener("click", () => {
        const isExpanded =
            menuToggle.getAttribute("aria-expanded") === "true";

        const nextExpanded = !isExpanded;

        menuToggle.setAttribute(
            "aria-expanded",
            String(nextExpanded)
        );

        navbar.classList.toggle("active", nextExpanded);

        menuToggle.setAttribute(
            "aria-label",
            nextExpanded ? "បិទម៉ឺនុយ" : "បើកម៉ឺនុយ"
        );
    });

    navbar.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navbar.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                "បើកម៉ឺនុយ"
            );
        });
    });
}


// =====================================================
// 20. SET MINIMUM START DATE
// =====================================================

if (startDateInput) {
    startDateInput.min = getLocalDateString();
}


// =====================================================
// 21. FOOTER YEAR
// =====================================================

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


// =====================================================
// 22. INITIALIZE WEBSITE
// =====================================================

renderSavedTrips();

console.log(
    "Kompot Trip Plan is ready! 🇰🇭"
);
