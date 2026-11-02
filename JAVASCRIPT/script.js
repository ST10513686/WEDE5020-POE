/* =============================================================
   DriveHub Motors - script.js
   WEDE5020 Part 3: dynamic content, search/sort, AJAX forms,
   validation and interactivity. Shared by every page; each
   function checks that its page elements exist before running.
   ============================================================= */

document.addEventListener("DOMContentLoaded", function () {
    setupScrollReveal();
    setupVehicleBrowser();
    setupGalleryLightbox();
    setupContactForm();
    setupEnquiryForm();
    setupMap();
});

/* -----------------------------------------------------------
   Shared helpers
   ----------------------------------------------------------- */
function showError(field, msg) {
    field.classList.add("invalid");
    field.setAttribute("aria-invalid", "true");
    const err = document.createElement("span");
    err.className = "field-error";
    err.textContent = msg;
    field.insertAdjacentElement("afterend", err);
}

function clearErrors(form) {
    form.querySelectorAll(".field-error").forEach((el) => el.remove());
    form.querySelectorAll(".invalid").forEach((el) => {
        el.classList.remove("invalid");
        el.removeAttribute("aria-invalid");
    });
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* South African numbers: 0 or +27 followed by 9 digits (spaces, dashes, brackets allowed) */
function isValidPhone(value) {
    const digits = value.replace(/[\s\-()]/g, "");
    return /^(\+27|0)\d{9}$/.test(digits);
}

function firstName(fullName) {
    return fullName.trim().split(/\s+/)[0];
}

function todayISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
}

/* AJAX: submit form data asynchronously with fetch (JSON) to the form's action URL.
   Rejects on network failure, timeout or a non-2xx response. */
async function submitAjax(form, payload) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(form.action, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=UTF-8" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        if (!response.ok) throw new Error("Server responded with " + response.status);
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

function setStatus(el, text, cls) {
    el.textContent = text;
    el.className = "form-status" + (cls ? " " + cls : "");
}

/* -----------------------------------------------------------
   1. Scroll-reveal animation (IntersectionObserver)
   ----------------------------------------------------------- */
function setupScrollReveal() {
    const targets = document.querySelectorAll("main > section, main > article, main > .vehicle-grid, main > .gallery-grid");
    if (!("IntersectionObserver" in window) || targets.length === 0) {
        targets.forEach((t) => t.classList.add("in-view"));
        return;
    }
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );
    targets.forEach((t) => {
        t.classList.add("reveal");
        observer.observe(t);
    });
}

/* -----------------------------------------------------------
   2. Products and Services - dynamic content + filter, search, sort
   ----------------------------------------------------------- */
const VEHICLES = [
    {
        name: "Range Rover Sport",
        category: "suv",
        categoryLabel: "SUVs and Off-Roaders",
        enquiryCategory: "SUV",
        img: "IMAGE/range-rover-sport-rear.jpg",
        alt: "Range Rover Sport rear view on the showroom floor",
        w: 400, h: 533,
    },
    {
        name: "Mercedes-AMG G63",
        category: "suv",
        categoryLabel: "SUVs and Off-Roaders",
        enquiryCategory: "SUV",
        img: "IMAGE/mercedes-amg-g63-rear.jpg",
        alt: "Mercedes-AMG G63 on the showroom floor",
        w: 400, h: 533,
    },
    {
        name: "Porsche 911 Carrera GTS",
        category: "sports",
        categoryLabel: "Sports and Performance",
        enquiryCategory: "Sports and Performance",
        img: "IMAGE/porsche-911-gts-rear.jpg",
        alt: "Porsche 911 Carrera GTS rear view showing the Pharoah Auto branded plate",
        w: 400, h: 533,
    },
    {
        name: "BMW M3",
        category: "sports",
        categoryLabel: "Sports and Performance",
        enquiryCategory: "Sports and Performance",
        img: "IMAGE/bmw-m3-g80-rear.jpg",
        alt: "BMW M3 rear view on the showroom floor",
        w: 400, h: 500,
    },
    {
        name: "Mercedes-Benz V300d (front)",
        category: "family",
        categoryLabel: "Family and Premium",
        enquiryCategory: "Family and Premium",
        img: "IMAGE/mercedes-v300d-front.jpg",
        alt: "Mercedes-Benz V300d front view on the showroom floor",
        w: 500, h: 333,
    },
    {
        name: "Mercedes-Benz V300d (rear)",
        category: "family",
        categoryLabel: "Family and Premium",
        enquiryCategory: "Family and Premium",
        img: "IMAGE/mercedes-v300d-rear.jpg",
        alt: "Mercedes-Benz V300d rear view on the showroom floor",
        w: 500, h: 333,
    },
];

const FILTER_DESCRIPTIONS = {
    all: "Browse our full hand-picked range, sourced through partners such as Pharoah Auto Investments.",
    suv: "From weekend getaways to the daily commute, our SUV range is built for comfort and presence.",
    sports: "For drivers who want a more spirited experience, our performance range delivers serious driving thrills.",
    family: "Need room for the whole family without giving up on comfort and finish? Our premium MPV range is built for exactly that.",
};

function getVisibleVehicles(state) {
    const query = state.query.trim().toLowerCase();
    let items = VEHICLES.filter((v) => state.filter === "all" || v.category === state.filter);

    if (query) {
        items = items.filter((v) => (v.name + " " + v.categoryLabel + " " + v.category).toLowerCase().includes(query));
    }

    const sorted = items.slice();
    if (state.sort === "name-desc") {
        sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (state.sort === "category") {
        sorted.sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel) || a.name.localeCompare(b.name));
    } else {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
}

function renderVehicles(state) {
    const list = document.getElementById("vehicle-list");
    if (!list) return;

    const items = getVisibleVehicles(state);
    list.innerHTML = "";

    items.forEach((v) => {
        const figure = document.createElement("figure");
        figure.innerHTML = `
            <img src="${v.img}" width="${v.w}" height="${v.h}" alt="${v.alt}" loading="lazy" decoding="async">
            <figcaption>
                ${v.name} &ndash; ${v.categoryLabel}<br>
                <a href="enquiry.html?category=${encodeURIComponent(v.enquiryCategory)}">Enquire about this vehicle</a>
            </figcaption>
        `;
        list.appendChild(figure);
    });

    const desc = document.getElementById("filter-description");
    if (desc) desc.textContent = FILTER_DESCRIPTIONS[state.filter] || FILTER_DESCRIPTIONS.all;

    const count = document.getElementById("vehicle-count");
    if (count) {
        count.textContent = items.length === 0
            ? "No vehicles match your search. Try a different word or clear the filter."
            : "Showing " + items.length + " of " + VEHICLES.length + " vehicles.";
    }
}

function setupVehicleBrowser() {
    const bar = document.querySelector(".filter-bar");
    if (!bar || !document.getElementById("vehicle-list")) return;

    const search = document.getElementById("vehicle-search");
    const sort = document.getElementById("vehicle-sort");
    const state = { filter: "all", query: "", sort: sort ? sort.value : "name-asc" };

    renderVehicles(state);

    bar.addEventListener("click", function (e) {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        bar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.filter = btn.dataset.filter;
        renderVehicles(state);
    });

    if (search) {
        search.addEventListener("input", function () {
            state.query = search.value;
            renderVehicles(state);
        });
    }

    if (sort) {
        sort.addEventListener("change", function () {
            state.sort = sort.value;
            renderVehicles(state);
        });
    }
}

/* -----------------------------------------------------------
   3. Gallery lightbox (modal)
   ----------------------------------------------------------- */
function setupGalleryLightbox() {
    const grid = document.querySelector(".gallery-grid");
    if (!grid) return;

    const images = Array.from(grid.querySelectorAll("img"));
    if (images.length === 0) return;

    const overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image viewer");
    overlay.innerHTML = `
        <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
        <button type="button" class="lightbox-prev" aria-label="Previous image">&#10094;</button>
        <img class="lightbox-img" src="" alt="">
        <p class="lightbox-caption"></p>
        <button type="button" class="lightbox-next" aria-label="Next image">&#10095;</button>
    `;
    document.body.appendChild(overlay);

    const lbImg = overlay.querySelector(".lightbox-img");
    const lbCaption = overlay.querySelector(".lightbox-caption");
    let currentIndex = 0;

    function open(index) {
        currentIndex = index;
        const img = images[currentIndex];
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        const figcaption = img.closest("figure").querySelector("figcaption");
        lbCaption.textContent = figcaption ? figcaption.textContent : img.alt;
        overlay.hidden = false;
        document.body.style.overflow = "hidden";
    }

    function close() {
        overlay.hidden = true;
        document.body.style.overflow = "";
    }

    function show(delta) {
        open((currentIndex + delta + images.length) % images.length);
    }

    images.forEach((img, index) => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => open(index));
    });

    overlay.querySelector(".lightbox-close").addEventListener("click", close);
    overlay.querySelector(".lightbox-prev").addEventListener("click", () => show(-1));
    overlay.querySelector(".lightbox-next").addEventListener("click", () => show(1));
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });
    document.addEventListener("keydown", (e) => {
        if (overlay.hidden) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") show(-1);
        if (e.key === "ArrowRight") show(1);
    });
}

/* -----------------------------------------------------------
   4. Contact form (contact.html) - validation, AJAX send, email compile
   ----------------------------------------------------------- */
const CONTACT_RECIPIENT = "info@drivehubmotors.co.za";

function buildMailto(name, email, phone, type, message) {
    const subject = encodeURIComponent("[" + type + "] Message from " + name);
    const body = encodeURIComponent(
        message + "\n\nFrom: " + name + " (" + email + ")" + (phone ? "\nPhone: " + phone : "")
    );
    return "mailto:" + CONTACT_RECIPIENT + "?subject=" + subject + "&body=" + body;
}

function setupContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const status = form.querySelector(".form-status");
    const button = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        clearErrors(form);

        const name = form.elements.name.value.trim();
        const email = form.elements.email.value.trim();
        const phone = form.elements.phone.value.trim();
        const type = form.elements["message-type"].value;
        const message = form.elements.message.value.trim();

        let valid = true;
        if (name.length < 2 || name.length > 60) {
            showError(form.elements.name, "Please enter your full name (2 to 60 characters).");
            valid = false;
        }
        if (!isValidEmail(email)) {
            showError(form.elements.email, "Please enter a valid email address.");
            valid = false;
        }
        if (phone && !isValidPhone(phone)) {
            showError(form.elements.phone, "Enter a valid number, e.g. 071 234 5678 or +27 71 234 5678.");
            valid = false;
        }
        if (!type) {
            showError(form.elements["message-type"], "Please choose a message type.");
            valid = false;
        }
        if (message.length < 10 || message.length > 1000) {
            showError(form.elements.message, "Message must be between 10 and 1000 characters.");
            valid = false;
        }

        if (!valid) {
            setStatus(status, "Please fix the highlighted fields and try again.", "error");
            return;
        }

        setStatus(status, "Sending...", "pending");
        button.disabled = true;

        const mailto = buildMailto(name, email, phone, type, message);

        try {
            await submitAjax(form, { name, email, phone, type, message });

            status.className = "form-status success";
            status.textContent = "Thanks, " + firstName(name) + " - your message was received. To email it to our team as well, ";
            const link = document.createElement("a");
            link.href = mailto;
            link.textContent = "click here to open your email app";
            status.appendChild(link);
            status.appendChild(document.createTextNode("."));
            form.reset();
        } catch (err) {
            status.className = "form-status error";
            status.textContent = "Sorry, we could not reach the server. Please try again, or ";
            const link = document.createElement("a");
            link.href = mailto;
            link.textContent = "send your message by email instead";
            status.appendChild(link);
            status.appendChild(document.createTextNode("."));
        } finally {
            button.disabled = false;
        }
    });
}

/* -----------------------------------------------------------
   5. Enquiry form (enquiry.html) - validation, AJAX, cost/availability response
   ----------------------------------------------------------- */
const ENQUIRY_RESPONSES = {
    purchase: (cat) =>
        "Thanks for your interest in our " + cat + " range. Full pricing and current stock details will be emailed to you within one business day.",
    financing: (cat) =>
        "Financing on our " + cat + " range typically starts from about R6,500 to R12,000 per month depending on the vehicle and deposit, subject to bank approval.",
    tradein: () =>
        "We offer free trade-in valuations on any vehicle, regardless of make. Bring your car to our showroom and we will give you a value.",
    testdrive: (cat, date) =>
        "Test drives for our " + cat + " range are available during showroom hours: Monday to Friday 08:00 to 17:30 and Saturday 09:00 to 14:00. " +
        "We will confirm your slot for " + date + " within 24 hours.",
};

function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function setupEnquiryForm() {
    const form = document.getElementById("enquiry-form");
    if (!form) return;
    const status = form.querySelector(".form-status");
    const responseBox = document.getElementById("enquiry-response");
    const button = form.querySelector("button[type='submit']");

    form.elements.date.min = todayISO();

    /* Pre-select the category when arriving from a vehicle link on the Products page */
    const wanted = new URLSearchParams(window.location.search).get("category");
    if (wanted && Array.from(form.elements.category.options).some((o) => o.value === wanted)) {
        form.elements.category.value = wanted;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        clearErrors(form);
        responseBox.hidden = true;

        const name = form.elements.name.value.trim();
        const email = form.elements.email.value.trim();
        const phone = form.elements.phone.value.trim();
        const category = form.elements.category.value;
        const type = form.elements.type.value;
        const date = form.elements.date.value;
        const message = form.elements.message.value.trim();

        let valid = true;
        if (name.length < 2 || name.length > 60) {
            showError(form.elements.name, "Please enter your full name (2 to 60 characters).");
            valid = false;
        }
        if (!isValidEmail(email)) {
            showError(form.elements.email, "Please enter a valid email address.");
            valid = false;
        }
        if (phone && !isValidPhone(phone)) {
            showError(form.elements.phone, "Enter a valid number, e.g. 071 234 5678 or +27 71 234 5678.");
            valid = false;
        }
        if (!category) {
            showError(form.elements.category, "Please select a vehicle category.");
            valid = false;
        }
        if (!type) {
            showError(form.elements.type, "Please select an enquiry type.");
            valid = false;
        }
        if (type === "testdrive" && !date) {
            showError(form.elements.date, "Please choose a preferred date for your test drive.");
            valid = false;
        } else if (date) {
            const chosen = new Date(date + "T00:00:00");
            if (isNaN(chosen.getTime()) || date < todayISO()) {
                showError(form.elements.date, "Please choose today's date or a date in the future.");
                valid = false;
            } else if (chosen.getDay() === 0) {
                showError(form.elements.date, "We are closed on Sundays. Please choose another day.");
                valid = false;
            }
        }
        if (message.length > 500) {
            showError(form.elements.message, "Additional details must be 500 characters or fewer.");
            valid = false;
        }

        if (!valid) {
            setStatus(status, "Please fix the highlighted fields and try again.", "error");
            return;
        }

        setStatus(status, "Processing your enquiry...", "pending");
        button.disabled = true;

        try {
            const result = await submitAjax(form, { name, email, phone, category, type, date, message });
            setStatus(status, "", "");

            const responseFn = ENQUIRY_RESPONSES[type] || ENQUIRY_RESPONSES.purchase;
            responseBox.textContent = "";

            const heading = document.createElement("strong");
            heading.textContent = "Thanks, " + firstName(name) + "!";
            const body = document.createElement("p");
            body.textContent = responseFn(category, date ? formatDate(date) : "your preferred day");
            responseBox.appendChild(heading);
            responseBox.appendChild(body);

            if (result && result.id) {
                const ref = document.createElement("p");
                ref.textContent = "Your reference number: DH-" + result.id;
                responseBox.appendChild(ref);
            }
            responseBox.hidden = false;
            form.reset();
            form.elements.date.min = todayISO();
        } catch (err) {
            setStatus(status, "Sorry, we could not reach the server. Please check your connection and try again.", "error");
        } finally {
            button.disabled = false;
        }
    });
}

/* -----------------------------------------------------------
   6. Interactive map (Leaflet + OpenStreetMap)
   ----------------------------------------------------------- */
function setupMap() {
    const mapEl = document.getElementById("map");
    if (!mapEl || typeof L === "undefined") return;

    const coords = [-26.1925, 28.0436]; // Braamfontein, Johannesburg
    const map = L.map("map").setView(coords, 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    }).addTo(map);

    L.marker(coords)
        .addTo(map)
        .bindPopup("<strong>DriveHub Motors</strong><br>123 Jorissen Street, Braamfontein")
        .openPopup();
}
