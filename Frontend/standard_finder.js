/* =========================================
   STANDARD FINDER
========================================= */


/* =========================================
   ELEMENTS
========================================= */

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

function searchStandards(query) {

    const originalText = searchButton.innerHTML;


    /* Loading state */

    searchButton.disabled = true;

    searchButton.innerHTML = `
        <span>Searching...</span>
    `;


    /* Scroll to results */

    setTimeout(function () {

        document
            .querySelector(".results-section")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }, 100);


    /*
        Temporary frontend behaviour.

        We are NOT pretending that these are
        actual BIS standards.

        The real results will come from your
        RAG + ChromaDB backend later.
    */

    setTimeout(function () {

        showTemporaryResult(query);

        searchButton.disabled = false;

        searchButton.innerHTML = originalText;

    }, 800);

}


/* =========================================
   TEMPORARY RESULT
========================================= */

function showTemporaryResult(query) {

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
            Standard search is ready
        </h3>


        <p>
            Your search for
            <strong>"${escapeHTML(query)}"</strong>
            has been received.
            Connect the BIS Sahayak RAG backend to retrieve
            the relevant BIS standards here.
        </p>

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