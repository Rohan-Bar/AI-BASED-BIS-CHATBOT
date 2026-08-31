/* =========================================
   STANDARD FINDER
========================================= */


/* =========================================
   ELEMENTS
========================================= */
if (!isLoggedIn()) {
    window.location.href = "login.html";
}


const searchInput = document.getElementById("standardSearch");

const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const intendedUse = document.getElementById("intendedUse");
const specification = document.getElementById("specification");

const searchButton = document.querySelector(".search-btn");
const findButton = document.querySelector(".find-btn");
const clearButton = document.querySelector(".clear-btn");

const resultCount = document.querySelector(".result-count");
const emptyState = document.querySelector(".empty-state");

const searchHints = document.querySelectorAll(".search-hint button");

const guideButton = document.querySelector(".guide-btn");


/* =========================================
   SEARCH BUTTON
========================================= */

searchButton.addEventListener("click", function () {

    const query = searchInput.value.trim();

    if (query === "") {

        searchInput.focus();

        searchInput.style.border = "1px solid #ef4444";

        setTimeout(() => {
            searchInput.style.border = "";
        }, 1500);

        return;
    }

    searchStandards(query);

});


/* =========================================
   ENTER KEY SEARCH
========================================= */

searchInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        searchButton.click();

    }

});


/* =========================================
   SEARCH HINT BUTTONS
========================================= */

searchHints.forEach(function (button) {

    button.addEventListener("click", function () {

        searchInput.value = button.textContent.trim();

        searchInput.focus();

        searchStandards(searchInput.value);

    });

});


/* =========================================
   FIND APPLICABLE STANDARDS
========================================= */

findButton.addEventListener("click", function () {

    const product = productName.value.trim();

    const category = productCategory.value;

    const use = intendedUse.value.trim();

    const specs = specification.value.trim();


    if (
        product === "" &&
        category === "" &&
        use === "" &&
        specs === ""
    ) {

        productName.focus();

        showMessage(
            "Please provide at least one product detail."
        );

        return;
    }


    /*
        For now this only demonstrates the UI.

        Later this function will send:

        product
        category
        intended use
        specifications

        to your FastAPI + RAG backend.
    */

    const query = [
        product,
        category,
        use,
        specs
    ]
        .filter(Boolean)
        .join(" ");


    searchStandards(query);

});


/* =========================================
   SEARCH FUNCTION
========================================= */
/* =========================================
   SEARCH FUNCTION — REAL BACKEND
========================================= */

async function searchStandards(query) {

    const originalText = searchButton.innerHTML;

    /* Loading state */

    searchButton.disabled = true;

    searchButton.innerHTML = `<span>Searching...</span>`;

    /* Scroll to results */

    setTimeout(function () {

        document
            .querySelector(".results-section")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }, 100);


    try {

        const data = await apiSearchStandards(query);

        renderResults(data);

    } catch (err) {

        resultCount.textContent = "0";

        emptyState.innerHTML = `

            <h3>Search failed</h3>

            <p>${escapeHTML(err.message)}</p>

        `;

    } finally {

        searchButton.disabled = false;

        searchButton.innerHTML = originalText;
    }
}


/* =========================================
   RENDER RESULTS
========================================= */

function renderResults(data) {

    const notFound =
        !data.is_number || data.is_number === "Not found";

    resultCount.textContent = notFound ? "0" : "1";

    if (notFound) {

        emptyState.innerHTML = `

            <div class="empty-icon">

                <svg width="38" height="38" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="1.7">
                    <circle cx="11" cy="11" r="7"></circle>
                    <path d="m20 20-4-4"></path>
                </svg>

            </div>

            <h3>No matching standard found</h3>

            <p>${escapeHTML(data.message || "Try a different product name.")}</p>
        `;

        return;
    }


    /* Real result card — uses your existing CSS classes */

    emptyState.innerHTML = `

        <div class="standard-card">

            <div class="standard-top">

                <span class="standard-number">
                    ${escapeHTML(data.is_number)}
                </span>

                <span class="relevance high">
                    HIGH RELEVANCE
                </span>

            </div>

            <h3>
                ${escapeHTML(data.title || "Relevant BIS Standard")}
            </h3>

            <p>
                ${escapeHTML(data.message)}
            </p>

            <div class="standard-meta">

                ${data.metadata && data.metadata.pdf_name
                    ? `<span>${escapeHTML(data.metadata.pdf_name)}</span>`
                    : ""}
                ${data.metadata && data.metadata.page !== undefined
                    ? `<span>Page ${escapeHTML(String(data.metadata.page))}</span>`
                    : ""}

                <span>
                    Indian Standard
                </span>

            </div>

            <div class="standard-actions">

                <button onclick="window.location.href='../../index.html'">
                    Ask BIS Sahayak
                </button>

            </div>

        </div>
    `;
}

/* =========================================
   CLEAR FORM
========================================= */

clearButton.addEventListener("click", function () {

    searchInput.value = "";

    productName.value = "";

    productCategory.value = "";

    intendedUse.value = "";

    specification.value = "";

    resultCount.textContent = "0";


    emptyState.innerHTML = `

        <div class="empty-icon">

            <svg
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
            >
                <circle
                    cx="11"
                    cy="11"
                    r="7"
                ></circle>

                <path
                    d="m20 20-4-4"
                ></path>

            </svg>

        </div>


        <h3>
            Your standards will appear here
        </h3>


        <p>
            Search for a product or provide product
            details above to discover relevant BIS standards.
        </p>

    `;

});


/* =========================================
   GUIDED HELP
========================================= */

guideButton.addEventListener("click", function () {

    document
        .querySelector(".details-section")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    setTimeout(function () {

        productName.focus();

    }, 600);

});


/* =========================================
   MESSAGE
========================================= */

function showMessage(message) {

    const oldMessage =
        document.querySelector(".finder-message");

    if (oldMessage) {
        oldMessage.remove();
    }


    const messageBox =
        document.createElement("div");

    messageBox.className =
        "finder-message";


    messageBox.textContent = message;


    document.body.appendChild(messageBox);


    setTimeout(function () {

        messageBox.classList.add("show");

    }, 10);


    setTimeout(function () {

        messageBox.classList.remove("show");

        setTimeout(function () {
            messageBox.remove();
        }, 300);

    }, 2500);

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}