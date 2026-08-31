/* =========================================
   LABORATORY PAGE
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const searchInput =
    document.getElementById("laboratorySearch");

const searchButton =
    document.getElementById("searchButton");

const findButton =
    document.getElementById("findButton");

const clearButton =
    document.getElementById("clearButton");

const guideButton =
    document.getElementById("guideButton");

const emptyState =
    document.getElementById("emptyState");

const resultsContainer =
    document.getElementById("resultsContainer");

const resultCount =
    document.getElementById("resultCount");

const productName =
    document.getElementById("productName");

const productCategory =
    document.getElementById("productCategory");

const testingArea =
    document.getElementById("testingArea");

const locationInput =
    document.getElementById("location");

const testRequirement =
    document.getElementById("testRequirement");


/* =========================================
   DEMO LABORATORY DATA
========================================= */

const laboratories = [

    {
        name: "BIS Testing Laboratory",
        location: "Kolkata, West Bengal",
        status: "DEMO FACILITY",
        description:
            "Testing facility for electrical, electronic and general product evaluation.",
        tests: [
            "Electrical Testing",
            "Safety Testing",
            "Performance Testing"
        ]
    },

    {
        name: "National Product Testing Centre",
        location: "New Delhi, Delhi",
        status: "DEMO FACILITY",
        description:
            "Multi-disciplinary testing facility supporting product quality and performance evaluation.",
        tests: [
            "Mechanical Testing",
            "Material Testing",
            "Performance Testing"
        ]
    },

    {
        name: "Industrial Chemical Testing Laboratory",
        location: "Mumbai, Maharashtra",
        status: "DEMO FACILITY",
        description:
            "Laboratory facility focused on chemical composition, material and quality analysis.",
        tests: [
            "Chemical Testing",
            "Material Analysis",
            "Composition Testing"
        ]
    },

    {
        name: "Advanced Electrical Test Centre",
        location: "Bengaluru, Karnataka",
        status: "DEMO FACILITY",
        description:
            "Specialized facility for electrical safety, performance and equipment testing.",
        tests: [
            "Electrical Testing",
            "Safety Testing",
            "Equipment Testing"
        ]
    },

    {
        name: "Materials & Mechanical Test Laboratory",
        location: "Chennai, Tamil Nadu",
        status: "DEMO FACILITY",
        description:
            "Testing facility for mechanical properties, durability and material performance.",
        tests: [
            "Mechanical Testing",
            "Material Testing",
            "Durability Testing"
        ]
    }

];


/* =========================================
   SHOW MESSAGE
========================================= */

function showMessage(message) {

    let messageBox =
        document.querySelector(".laboratory-message");


    if (!messageBox) {

        messageBox =
            document.createElement("div");

        messageBox.className =
            "laboratory-message";

        document.body.appendChild(
            messageBox
        );
    }


    messageBox.textContent = message;

    messageBox.classList.add("show");


    setTimeout(() => {

        messageBox.classList.remove("show");

    }, 2500);
}


/* =========================================
   RENDER LABORATORIES
========================================= */

function renderLaboratories(data) {

    resultsContainer.innerHTML = "";


    if (data.length === 0) {

        emptyState.style.display = "flex";

        resultCount.textContent = "0";

        return;
    }


    emptyState.style.display = "none";

    resultCount.textContent =
        data.length;


    data.forEach(lab => {

        const card =
            document.createElement("div");

        card.className =
            "laboratory-card";


        card.innerHTML = `

            <div class="lab-top">

                <div>

                    <h3 class="lab-name">
                        ${lab.name}
                    </h3>

                    <div class="lab-location">

                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2">

                            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path>

                            <circle cx="12" cy="10" r="2.5"></circle>

                        </svg>

                        ${lab.location}

                    </div>

                </div>


                <span class="lab-status">
                    ${lab.status}
                </span>

            </div>


            <p class="lab-description">
                ${lab.description}
            </p>


            <div class="lab-tags">

                ${lab.tests
                    .map(test =>
                        `<span>${test}</span>`
                    )
                    .join("")}

            </div>


            <div class="lab-actions">

                <button
                    class="view-btn"
                    onclick="viewLaboratory('${lab.name}')">

                    View Details

                </button>


                <button
                    class="contact-btn"
                    onclick="contactLaboratory('${lab.name}')">

                    Contact Laboratory

                </button>

            </div>

        `;


        resultsContainer.appendChild(card);

    });

}


/* =========================================
   SEARCH LABORATORIES
========================================= */

function searchLaboratories() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!query) {

        showMessage(
            "Enter a product, test or location to search."
        );

        return;
    }


    const filtered =
        laboratories.filter(lab => {

            const searchableText = [

                lab.name,

                lab.location,

                lab.description,

                ...lab.tests

            ]
                .join(" ")
                .toLowerCase();


            return searchableText.includes(query);

        });


    renderLaboratories(filtered);


    document
        .querySelector(".results-section")
        .scrollIntoView({
            behavior: "smooth"
        });


    if (filtered.length === 0) {

        showMessage(
            "No demo laboratories matched your search."
        );
    }
}


/* =========================================
   FORM SEARCH
========================================= */

function findSuitableLaboratories() {

    const product =
        productName.value
            .trim()
            .toLowerCase();

    const category =
        productCategory.value
            .toLowerCase();

    const area =
        testingArea.value
            .toLowerCase();

    const location =
        locationInput.value
            .trim()
            .toLowerCase();

    const requirement =
        testRequirement.value
            .trim()
            .toLowerCase();


    const query =
        [

            product,

            category,

            area,

            location,

            requirement

        ]
        .filter(Boolean)
        .join(" ");


    if (!query) {

        showMessage(
            "Please provide at least one testing requirement."
        );

        return;
    }


    const filtered =
        laboratories.filter(lab => {

            const searchableText = [

                lab.name,

                lab.location,

                lab.description,

                ...lab.tests

            ]
                .join(" ")
                .toLowerCase();


            return searchableText
                .split(" ")
                .some(word =>
                    query.includes(word)
                );

        });


    /*
       If the entered information doesn't match
       a demo laboratory, show all demo laboratories
       as a fallback.
    */

    if (filtered.length === 0) {

        renderLaboratories(
            laboratories.slice(0, 3)
        );

        showMessage(
            "Showing demo laboratory recommendations."
        );

    } else {

        renderLaboratories(filtered);

    }


    document
        .querySelector(".results-section")
        .scrollIntoView({
            behavior: "smooth"
        });
}


/* =========================================
   CLEAR FORM
========================================= */

function clearForm() {

    productName.value = "";

    productCategory.value = "";

    testingArea.value = "";

    locationInput.value = "";

    testRequirement.value = "";

    searchInput.value = "";


    resultsContainer.innerHTML = "";

    resultCount.textContent = "0";

    emptyState.style.display = "flex";


    showMessage(
        "Laboratory search form cleared."
    );
}


/* =========================================
   QUICK SEARCH BUTTONS
========================================= */

document
    .querySelectorAll(".search-hint button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const value =
                    button.dataset.search;

                searchInput.value =
                    value;

                searchLaboratories();

            }
        );

    });


/* =========================================
   TESTING AREA CARDS
========================================= */

document
    .querySelectorAll(".testing-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const value =
                    card.dataset.search;


                searchInput.value =
                    value;


                searchLaboratories();

            }
        );

    });


/* =========================================
   SEARCH EVENTS
========================================= */

searchButton.addEventListener(
    "click",
    searchLaboratories
);


searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchLaboratories();

        }

    }
);


/* =========================================
   FIND BUTTON
========================================= */

findButton.addEventListener(
    "click",
    findSuitableLaboratories
);


/* =========================================
   CLEAR BUTTON
========================================= */

clearButton.addEventListener(
    "click",
    clearForm
);


/* =========================================
   GUIDED HELP
========================================= */

guideButton.addEventListener(
    "click",
    () => {

        showMessage(
            "Guided laboratory assistance will be available here."
        );

    }
);


/* =========================================
   LAB DETAILS
========================================= */

function viewLaboratory(name) {

    showMessage(
        `${name} — laboratory details will appear here.`
    );

}


/* =========================================
   LAB CONTACT
========================================= */

function contactLaboratory(name) {

    showMessage(
        `Contact information for ${name} will appear here.`
    );

}


/* =========================================
   INITIAL STATE
========================================= */

emptyState.style.display = "flex";

resultCount.textContent = "0";