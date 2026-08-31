/* =====================================================
   COMPLIANCE CHECKER — REAL BACKEND
   Backend endpoint: POST /compliance/check (multipart)
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       LOGIN PROTECTION
    ========================================== */

    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }


    /* =========================================
       ELEMENTS
    ========================================== */

    const mainSearchInput =
        document.querySelector(".compliance-search input");

    const mainSearchButton =
        document.querySelector(".compliance-search button");

    const tryButtons =
        document.querySelectorAll(".try-section button");

    const assessmentButton =
        document.getElementById("assessmentBtn");

    const clearButton =
        document.querySelector(".clear-btn");

    const productNameInput =
        document.querySelector(
            '.details-card input[placeholder="e.g. 12W LED Lamp"]'
        );

    const formGrid =
        document.querySelector(".form-grid");

    const categorySelect =
        formGrid.querySelectorAll("select")[0];

    const manufacturerSelect =
        formGrid.querySelectorAll("select")[1];

    const intendedUseInput =
        document.querySelector(
            'input[placeholder="e.g. Residential lighting"]'
        );

    const specificationsInput =
        document.querySelector(
            ".specification-field textarea"
        );

    const certificationInput =
        document.querySelector(
            'input[placeholder*="Existing BIS"]'
        );

    const fileInput =
        document.querySelector(
            '.upload-box input[type="file"]'
        );

    const resultsSection =
        document.querySelector(".results-section");

    const emptyResults =
        document.querySelector(".empty-results");

    const resultCount =
        document.querySelector(".result-count strong");

    const resultCountText =
        document.querySelector(".result-count span");

    const guidedButton =
        document.querySelector(".guided-btn");

    const profileButton =
        document.querySelector(".profile-btn");

    const languageButton =
        document.querySelector(".language");


    /* =========================================
       SAFETY CHECK
    ========================================== */

    console.log("Compliance Checker JS loaded");

    if (!assessmentButton) {
        console.error(
            "Assessment button not found. Check id='assessmentBtn'."
        );
        return;
    }

    if (typeof apiCheckCompliance !== "function") {
        console.error(
            "apiCheckCompliance not found — is api.js included BEFORE compliance.js in the HTML?"
        );
        return;
    }


    /* =========================================
       MAIN "CHECK COMPLIANCE" BUTTON
    ========================================== */

    mainSearchButton.addEventListener(
        "click",
        function () {

            const product =
                mainSearchInput.value.trim();

            if (product === "") {

                showNotification(
                    "Please enter a product name first.",
                    "warning"
                );

                mainSearchInput.focus();

                return;
            }

            productNameInput.value = product;

            runComplianceCheck();
        }
    );


    /* =========================================
       ENTER KEY IN MAIN SEARCH
    ========================================== */

    mainSearchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                mainSearchButton.click();
            }
        }
    );


    /* =========================================
       QUICK PRODUCT BUTTONS
    ========================================== */

    tryButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const product =
                        button.textContent.trim();

                    mainSearchInput.value = product;

                    productNameInput.value = product;

                    runComplianceCheck();
                }
            );
        }
    );


    /* =========================================
       START COMPLIANCE ASSESSMENT
    ========================================== */

    assessmentButton.addEventListener(
        "click",
        function () {

            runComplianceCheck();
        }
    );


    /* =========================================
       RUN COMPLIANCE CHECK — REAL BACKEND
    ========================================== */

    async function runComplianceCheck() {

        let productName =
            productNameInput.value.trim() ||
            mainSearchInput.value.trim();

        if (productName === "") {

            showNotification(
                "Please enter a product name first.",
                "warning"
            );

            mainSearchInput.focus();

            return;
        }

        /* Loading state */

        assessmentButton.disabled = true;

        assessmentButton.innerHTML =
            `Checking Compliance <span>...</span>`;

        resultCount.textContent = "...";
        resultCountText.textContent = "assessment";

        emptyResults.innerHTML = `

            <h3>
                Assessing compliance for
                <strong>${escapeHTML(productName)}</strong>...
            </h3>

            <p>
                This may take a few seconds —
                the AI is checking BIS documents.
            </p>

        `;

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        try {

            const data = await apiCheckCompliance(
                {
                    product_name: productName,
                    intended_use: intendedUseInput.value.trim(),
                    manufacturer_type: manufacturerSelect.value,
                    product_specification: specificationsInput.value.trim(),
                    existing_certification: certificationInput.value.trim()
                },
                fileInput.files.length > 0
                    ? fileInput.files[0]
                    : null
            );

            displayResult(data);

        } catch (err) {

            emptyResults.innerHTML = `

                <h3>Compliance check failed</h3>

                <p>${escapeHTML(err.message)}</p>

            `;

        } finally {

            assessmentButton.disabled = false;

            assessmentButton.innerHTML =
                `Start Compliance Assessment <span>→</span>`;
        }
    }


    /* =========================================
       DISPLAY RESULT — REAL BACKEND DATA
       Response shape:
       {
         product_name, similarity_percentage,
         met_count, missing_count,
         requirements: [ { requirement, status,
             pdf_name, page } ],
         message
       }
    ========================================== */

    function displayResult(data) {

        resultCount.textContent = "1";
        resultCountText.textContent = "assessment";

        const score =
            data.similarity_percentage || 0;

        const statusText =
            score >= 80
                ? "Mostly Compliant"
                : score >= 40
                    ? "Partially Compliant"
                    : "Significant Gaps";

        /* Requirements list — colour by status */

        const requirementsHTML = (data.requirements || [])
            .map(function (item) {

                const badge =
                    item.status === "met"
                        ? `<span class="req-badge met">FULFILLED</span>`
                        : `<span class="req-badge missing">MISSING</span>`;

                const source =
                    item.pdf_name
                        ? `<small>Source: ${escapeHTML(item.pdf_name)}` +
                          (item.page
                              ? `, page ${escapeHTML(String(item.page))}`
                              : "") +
                          `</small>`
                        : "";

                return `
                    <li>
                        ${badge}
                        ${escapeHTML(item.requirement)}
                        ${source}
                    </li>
                `;
            })
            .join("");

        emptyResults.innerHTML = `

            <div class="result-report">

                <!-- TOP -->

                <div class="report-top">

                    <div>

                        <span class="result-label">
                            PRODUCT ASSESSED
                        </span>

                        <h3>
                            ${escapeHTML(data.product_name)}
                        </h3>

                    </div>

                    <div class="status-badge">
                        ${statusText}
                    </div>

                </div>


                <!-- SCORE -->

                <div class="compliance-score">

                    <div class="score-circle">

                        <strong>
                            ${score}%
                        </strong>

                        <span>
                            Compliant
                        </span>

                    </div>


                    <div class="score-info">

                        <h4>
                            Compliance Assessment
                        </h4>

                        <p>
                            ${escapeHTML(data.message || "")}
                        </p>

                        <p>
                            <strong>${data.met_count}</strong>
                            requirements fulfilled ·
                            <strong>${data.missing_count}</strong>
                            still missing
                        </p>

                    </div>

                </div>


                <!-- REQUIREMENTS -->

                <div class="requirements">

                    <h4>
                        Compliance Requirements
                    </h4>

                    <ul>
                        ${requirementsHTML ||
                          "<li>No requirements identified.</li>"}
                    </ul>

                </div>


                <!-- ACTIONS -->

                <div class="report-actions">

                    <button
                        type="button"
                        class="secondary-result-btn"
                        id="newAssessment">

                        New Assessment

                    </button>

                </div>

            </div>
        `;


        /* Scroll to results */

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        /* New Assessment button */

        const newAssessment =
            document.getElementById("newAssessment");

        if (newAssessment) {

            newAssessment.addEventListener(
                "click",
                function () {

                    clearForm();

                    document
                        .querySelector(".details-section")
                        .scrollIntoView({
                            behavior: "smooth"
                        });
                }
            );
        }
    }


    /* =========================================
       CLEAR BUTTON
    ========================================== */

    clearButton.addEventListener(
        "click",
        function () {

            clearForm();
        }
    );


    function clearForm() {

        mainSearchInput.value = "";

        productNameInput.value = "";

        categorySelect.selectedIndex = 0;

        manufacturerSelect.selectedIndex = 0;

        intendedUseInput.value = "";

        specificationsInput.value = "";

        certificationInput.value = "";

        fileInput.value = "";

        resultCount.textContent = "—";
        resultCountText.textContent = "assessment";

        emptyResults.innerHTML = `

            <div class="empty-icon">

                <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none">

                    <path
                        d="M9 11L11 13L15 9"
                        stroke="#2563EB"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                    <path
                        d="M5 3H14L19 8V21H5V3Z"
                        stroke="#2563EB"
                        stroke-width="1.7"
                        stroke-linejoin="round"
                    />

                    <path
                        d="M14 3V8H19"
                        stroke="#2563EB"
                        stroke-width="1.7"
                        stroke-linejoin="round"
                    />

                </svg>

            </div>


            <h3>
                Your compliance report will appear here
            </h3>


            <p>

                Submit your product information above to identify
                applicable standards, compliance requirements,
                missing documents and potential gaps.

            </p>

        `;

        showNotification(
            "Form cleared successfully.",
            "info"
        );
    }


    /* =========================================
       FILE UPLOAD VALIDATION
    ========================================== */

    fileInput.addEventListener(
        "change",
        function () {

            if (fileInput.files.length === 0) {
                return;
            }

            const file = fileInput.files[0];

            const fileName =
                file.name.toLowerCase();

            /* Backend only supports PDF */

            if (!fileName.endsWith(".pdf")) {

                showNotification(
                    "Please upload a PDF file " +
                    "(the backend only processes PDFs).",
                    "warning"
                );

                fileInput.value = "";

                return;
            }

            /* Maximum file size = 10 MB */

            const maxSize =
                10 * 1024 * 1024;

            if (file.size > maxSize) {

                showNotification(
                    "File size should be less than 10 MB.",
                    "warning"
                );

                fileInput.value = "";

                return;
            }

            showNotification(
                `${file.name} selected successfully.`,
                "success"
            );
        }
    );


    /* =========================================
       GUIDED HELP
    ========================================== */

    guidedButton.addEventListener(
        "click",
        function () {

            startGuidedHelp();
        }
    );


    function startGuidedHelp() {

        const product =
            prompt(
                "What is the name of your product?"
            );

        if (product === null || product.trim() === "") {
            return;
        }

        mainSearchInput.value = product.trim();

        productNameInput.value = product.trim();

        const intendedUse =
            prompt(
                "What is the intended use of your product?"
            );

        if (
            intendedUse !== null &&
            intendedUse.trim() !== ""
        ) {

            intendedUseInput.value =
                intendedUse.trim();
        }

        runComplianceCheck();
    }


    /* =========================================
       PROFILE
    ========================================== */

    profileButton.addEventListener(
        "click",
        function () {

            showNotification(
                "Profile functionality will be connected to your authentication system.",
                "info"
            );
        }
    );


    /* =========================================
       LANGUAGE
    ========================================== */

    languageButton.addEventListener(
        "click",
        function () {

            showNotification(
                "Language selection will be available soon.",
                "info"
            );
        }
    );


    /* =========================================
       ESCAPE HTML
    ========================================== */

    function escapeHTML(value) {

        const div = document.createElement("div");

        div.textContent = value;

        return div.innerHTML;
    }


    /* =========================================
       NOTIFICATION
    ========================================== */

    function showNotification(
        message,
        type
    ) {

        const old =
            document.querySelector(
                ".compliance-notification"
            );

        if (old) {
            old.remove();
        }

        const notification =
            document.createElement("div");

        notification.className =
            `compliance-notification ${type}`;

        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(
            function () {

                notification.classList.add("show");

            },
            10
        );

        setTimeout(
            function () {

                notification.classList.remove("show");

                setTimeout(
                    function () {
                        notification.remove();
                    },
                    300
                );

            },
            3000
        );
    }

});
