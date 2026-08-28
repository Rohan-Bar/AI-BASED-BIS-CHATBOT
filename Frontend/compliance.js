document.addEventListener("DOMContentLoaded", function () {

    /* 
       ELEMENTS
  */

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


    /* 
       CHECK THAT IMPORTANT ELEMENTS EXIST
 */

    console.log("Compliance Checker JS loaded");

    console.log("Assessment button:", assessmentButton);


    if (!assessmentButton) {

        console.error(
            "Assessment button not found. Check id='assessmentBtn'."
        );

        return;

    }


    /* 
       DEMO COMPLIANCE DATA

       This is frontend demo data.

       Later this will come from:
       JavaScript → FastAPI → RAG → pgvector → BIS PDFs
    */

    const complianceData = {

        "12w led lamp": {

            standard: "IS 16102 (Part 1): 2012",

            category: "Electrical & Electronics",

            score: 82,

            status: "Likely Applicable",

            requirements: [
                "Electrical safety requirements should be verified.",
                "Applicable LED lamp testing requirements should be checked.",
                "Product marking and labeling requirements should be verified.",
                "Manufacturer and product information should be available."
            ],

            documents: [
                "Product technical specification",
                "Electrical safety test report",
                "Manufacturer details",
                "Product labeling information"
            ]

        },


        "electric iron": {

            standard: "IS 302 (Part 2/3): 2017",

            category: "Electrical & Electronics",

            score: 88,

            status: "Likely Applicable",

            requirements: [
                "Electrical safety requirements should be satisfied.",
                "Insulation and protection requirements should be verified.",
                "Heating element safety should be checked.",
                "Product marking requirements should be verified."
            ],

            documents: [
                "Electrical safety test report",
                "Product specification",
                "Manufacturer information",
                "Certification details"
            ]

        },


        "pressure cooker": {

            standard: "IS 2347: 2017",

            category: "Other",

            score: 91,

            status: "Likely Applicable",

            requirements: [
                "Pressure vessel safety requirements should be verified.",
                "Material specifications should be checked.",
                "Safety valve requirements should be verified.",
                "Product marking requirements should be checked."
            ],

            documents: [
                "Material specification",
                "Pressure test report",
                "Safety valve information",
                "Manufacturer information"
            ]

        }

    };


    /* 
       MAIN "CHECK COMPLIANCE" BUTTON
   */

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


            /*
            Also copy product to
            optional Product Name field
            */

            productNameInput.value =
                product;


            runComplianceCheck(product);

        }
    );


    /* 
       ENTER KEY IN MAIN SEARCH
   */

    mainSearchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                mainSearchButton.click();

            }

        }
    );


    /* 
       QUICK PRODUCT BUTTONS
  */

    tryButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const product =
                        button.textContent.trim();


                    mainSearchInput.value =
                        product;


                    productNameInput.value =
                        product;


                    runComplianceCheck(product);

                }
            );

        }
    );


    /* 
       START COMPLIANCE ASSESSMENT
    */

    assessmentButton.addEventListener(
        "click",
        function () {

            console.log(
                "Start Compliance Assessment clicked"
            );


            /*
            Get product name
            */

            let productName =
                productNameInput.value.trim();


            /*
            If optional product name is empty,
            use main search input.
            */

            if (productName === "") {

                productName =
                    mainSearchInput.value.trim();

            }


            /*
            Validate product name
            */

            if (productName === "") {

                showNotification(
                    "Please enter your product name before starting the assessment.",
                    "warning"
                );

                productNameInput.focus();

                return;

            }


            /*
            Collect form information
            */

            const assessmentData = {

                productName:
                    productName,

                category:
                    categorySelect.value,

                intendedUse:
                    intendedUseInput.value.trim(),

                manufacturer:
                    manufacturerSelect.value,

                specifications:
                    specificationsInput.value.trim(),

                certification:
                    certificationInput.value.trim(),

                document:
                    fileInput.files.length > 0
                        ? fileInput.files[0].name
                        : null

            };


            console.log(
                "Assessment Data:",
                assessmentData
            );


            /*
            Loading state
            */

            assessmentButton.disabled = true;

            assessmentButton.innerHTML =
                `Checking Compliance <span>...</span>`;


            /*
            Simulate assessment.

            Later replace this with fetch()
            to your FastAPI backend.
            */

            setTimeout(
                function () {

                    runComplianceCheck(
                        productName
                    );


                    assessmentButton.disabled =
                        false;


                    assessmentButton.innerHTML =
                        `Start Compliance Assessment <span>→</span>`;

                },
                1200
            );

        }
    );


    /*
       RUN COMPLIANCE CHECK
     */

    function runComplianceCheck(productName) {

        const key =
            productName.toLowerCase().trim();


        let result =
            complianceData[key];


        /*
        Unknown product
        */

        if (!result) {

            result = {

                standard:
                    "Applicable BIS Standard To Be Identified",

                category:
                    categorySelect.value !==
                    "Select category"

                        ? categorySelect.value

                        : "To Be Determined",

                score: 0,

                status:
                    "Assessment Required",

                requirements: [

                    "Applicable Indian Standard needs to be identified.",

                    "Product specifications need to be reviewed.",

                    "Testing requirements need to be determined.",

                    "Certification requirements need to be verified."

                ],

                documents: [

                    "Product technical specification",

                    "Applicable test report",

                    "Manufacturer information",

                    "Product certification details"

                ]

            };

        }


        displayResult(
            productName,
            result
        );

    }


    /* 
       DISPLAY RESULT
    */

    function displayResult(
        productName,
        result
    ) {

        /*
        Update result count
        */

        resultCount.textContent =
            "1";

        resultCountText.textContent =
            "assessment";


        /*
        Requirements
        */

        const requirementsHTML =
            result.requirements
                .map(
                    function (item) {

                        return `
                            <li>
                                ${item}
                            </li>
                        `;

                    }
                )
                .join("");


        /*
        Documents
        */

        const documentsHTML =
            result.documents
                .map(
                    function (item) {

                        return `
                            <li>
                                ${item}
                            </li>
                        `;

                    }
                )
                .join("");


        /*
        Result HTML
        */

        emptyResults.innerHTML = `

            <div class="result-report">

                <!-- TOP -->

                <div class="report-top">

                    <div>

                        <span class="result-label">
                            PRODUCT ASSESSED
                        </span>

                        <h3>
                            ${productName}
                        </h3>

                    </div>


                    <div class="status-badge">

                        ${result.status}

                    </div>

                </div>


                <!-- SCORE -->

                <div class="compliance-score">

                    <div class="score-circle">

                        <strong>
                            ${result.score}%
                        </strong>

                        <span>
                            Match
                        </span>

                    </div>


                    <div class="score-info">

                        <h4>
                            Compliance Assessment
                        </h4>

                        <p>

                            Based on the information provided,
                            this product shows approximately
                            ${result.score}% alignment with
                            the identified compliance requirements.

                        </p>

                    </div>

                </div>


                <!-- INFORMATION -->

                <div class="result-grid">


                    <div class="result-card">

                        <span>
                            APPLICABLE STANDARD
                        </span>

                        <strong>
                            ${result.standard}
                        </strong>

                    </div>


                    <div class="result-card">

                        <span>
                            PRODUCT CATEGORY
                        </span>

                        <strong>
                            ${result.category}
                        </strong>

                    </div>


                </div>


                <!-- REQUIREMENTS -->

                <div class="requirements">

                    <h4>
                        Key Compliance Requirements
                    </h4>

                    <ul>

                        ${requirementsHTML}

                    </ul>

                </div>


                <!-- DOCUMENTS -->

                <div class="missing-documents">

                    <h4>
                        Documents / Information To Verify
                    </h4>

                    <ul>

                        ${documentsHTML}

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


                    <button
                        type="button"
                        class="primary-result-btn"
                        id="viewReport">

                        View Full Report →

                    </button>

                </div>

            </div>

        `;


        /*
        Scroll to results
        */

        resultsSection.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });


        /* 
           NEW ASSESSMENT
 */

        const newAssessment =
            document.getElementById(
                "newAssessment"
            );


        if (newAssessment) {

            newAssessment.addEventListener(
                "click",
                function () {

                    clearForm();


                    document
                        .querySelector(
                            ".details-section"
                        )
                        .scrollIntoView({

                            behavior: "smooth"

                        });

                }
            );

        }


        /* 
           VIEW FULL REPORT
         */

        const viewReport =
            document.getElementById(
                "viewReport"
            );


        if (viewReport) {

            viewReport.addEventListener(
                "click",
                function () {

                    showNotification(

                        "Full report generation will be connected to the FastAPI backend.",

                        "info"

                    );

                }
            );

        }

    }


    /* 
       CLEAR BUTTON
   */

    clearButton.addEventListener(
        "click",
        function () {

            clearForm();

        }
    );


    function clearForm() {

        /*
        Main search
        */

        mainSearchInput.value =
            "";


        /*
        Product
        */

        productNameInput.value =
            "";


        /*
        Category
        */

        categorySelect.selectedIndex =
            0;


        /*
        Manufacturer
        */

        manufacturerSelect.selectedIndex =
            0;


        /*
        Intended use
        */

        intendedUseInput.value =
            "";


        /*
        Specifications
        */

        specificationsInput.value =
            "";


        /*
        Certification
        */

        certificationInput.value =
            "";


        /*
        File
        */

        fileInput.value =
            "";


        /*
        Result counter
        */

        resultCount.textContent =
            "—";

        resultCountText.textContent =
            "assessment";


        /*
        Restore empty results
        */

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


    /* 
       FILE UPLOAD
*/

    fileInput.addEventListener(
        "change",
        function () {

            if (
                fileInput.files.length === 0
            ) {

                return;

            }


            const file =
                fileInput.files[0];


            /*
            Allowed extensions
            */

            const fileName =
                file.name.toLowerCase();


            const allowed =
                fileName.endsWith(".pdf") ||
                fileName.endsWith(".doc") ||
                fileName.endsWith(".docx");


            if (!allowed) {

                showNotification(
                    "Please upload a PDF, DOC or DOCX file.",
                    "warning"
                );

                fileInput.value =
                    "";

                return;

            }


            /*
            Maximum file size = 10 MB
            */

            const maxSize =
                10 * 1024 * 1024;


            if (file.size > maxSize) {

                showNotification(
                    "File size should be less than 10 MB.",
                    "warning"
                );

                fileInput.value =
                    "";

                return;

            }


            showNotification(
                `${file.name} selected successfully.`,
                "success"
            );


            console.log(
                "Selected document:",
                file
            );

        }
    );


    /* 
       GUIDED HELP
   */

    guidedButton.addEventListener(
        "click",
        function () {

            startGuidedHelp();

        }
    );


    function startGuidedHelp() {

        /*
        Product question
        */

        const product =
            prompt(
                "What is the name of your product?"
            );


        if (
            product === null ||
            product.trim() === ""
        ) {

            return;

        }


        /*
        Put product into fields
        */

        mainSearchInput.value =
            product.trim();

        productNameInput.value =
            product.trim();


        /*
        Intended use
        */

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


        /*
        Run assessment
        */

        runComplianceCheck(
            product.trim()
        );

    }


    /* 
       PROFILE
     */

    profileButton.addEventListener(
        "click",
        function () {

            showNotification(
                "Profile functionality will be connected to your authentication system.",
                "info"
            );

        }
    );


    /*
       LANGUAGE
   */

    languageButton.addEventListener(
        "click",
        function () {

            showNotification(
                "Language selection will be available soon.",
                "info"
            );

        }
    );


    /* 
       NOTIFICATION
     */

    function showNotification(
        message,
        type
    ) {

        /*
        Remove previous notification
        */

        const old =
            document.querySelector(
                ".compliance-notification"
            );


        if (old) {

            old.remove();

        }


        /*
        Create notification
        */

        const notification =
            document.createElement("div");


        notification.className =
            `compliance-notification ${type}`;


        notification.textContent =
            message;


        document.body.appendChild(
            notification
        );


        /*
        Start animation
        */

        setTimeout(
            function () {

                notification.classList.add(
                    "show"
                );

            },
            10
        );


        /*
        Remove after 3 seconds
        */

        setTimeout(
            function () {

                notification.classList.remove(
                    "show"
                );


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