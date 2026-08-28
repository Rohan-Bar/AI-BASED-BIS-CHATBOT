/* ============================================================
   CERTIFICATION ROADMAP
============================================================ */


/* ============================================================
   STEP DATA
============================================================ */

const steps = [

    {
        title: "Identify Your Product",
        description:
            "Tell us about your product so BIS Sahayak can determine the relevant standards and certification requirements."
    },

    {
        title: "Find Applicable Standard",
        description:
            "Identify the Indian Standard that may apply to your product."
    },

    {
        title: "Check Compliance",
        description:
            "Review your product against the applicable requirements."
    },

    {
        title: "Prepare",
        description:
            "Prepare the documents, reports and information required for certification."
    },

    {
        title: "Get Certified",
        description:
            "Your certification journey is now organized into a clear roadmap."
    }

];


/* ============================================================
   ELEMENTS
============================================================ */

const roadmapSteps =
    document.querySelectorAll(".roadmap-step");

const progressTitle =
    document.getElementById("progressTitle");

const progressPercent =
    document.getElementById("progressPercent");

const progressFill =
    document.getElementById("progressFill");

const roadmapLineFill =
    document.getElementById("roadmapLineFill");

const contentStep =
    document.getElementById("contentStep");

const contentTitle =
    document.getElementById("contentTitle");

const contentDescription =
    document.getElementById("contentDescription");

const visualNumber =
    document.getElementById("visualNumber");

const previousBtn =
    document.getElementById("previousBtn");

const nextBtn =
    document.getElementById("nextBtn");


/* ============================================================
   FORMS
============================================================ */

const roadmapForm =
    document.getElementById("roadmapForm");

const standardForm =
    document.getElementById("standardForm");

const complianceForm =
    document.getElementById("complianceForm");

const prepareForm =
    document.getElementById("prepareForm");

const roadmapResult =
    document.getElementById("roadmapResult");

const resultText =
    document.getElementById("resultText");


/* ============================================================
   FINAL SUMMARY ELEMENTS
============================================================ */

const finalSummary =
    document.getElementById("finalSummary");

const summaryProduct =
    document.getElementById("summaryProduct");

const summaryCategory =
    document.getElementById("summaryCategory");

const summaryStandard =
    document.getElementById("summaryStandard");

const newAssessmentBtn =
    document.getElementById("newAssessmentBtn");

const summaryHomeBtn =
    document.getElementById("summaryHomeBtn");


/* ============================================================
   SIDEBAR ELEMENTS
============================================================ */

const sidebar =
    document.getElementById("sidebar");

const hamburger =
    document.getElementById("hamburger");

const closeMenu =
    document.getElementById("closeMenu");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/* ============================================================
   LANGUAGE ELEMENTS
============================================================ */

const languageBtn =
    document.getElementById("languageBtn");

const languageMenu =
    document.getElementById("languageMenu");


/* ============================================================
   CURRENT STEP
============================================================ */

let currentStep = 1;


/* ============================================================
   COLLECT USER ANSWERS
============================================================ */

const roadmapData = {

    productName: "",
    productCategory: "",
    intendedUse: "",
    specifications: "",
    productSource: "",

    knowsStandard: "",
    standardNumber: "",

    technicalCompliance: "",
    testReports: "",

    preparation: []

};


/* ============================================================
   SAVE STEP 1
============================================================ */

function saveStep1() {

    roadmapData.productName =
        document.getElementById("productName")?.value.trim() || "";

    roadmapData.productCategory =
        document.getElementById("productCategory")?.value || "";

    roadmapData.intendedUse =
        document.getElementById("intendedUse")?.value.trim() || "";

    roadmapData.specifications =
        document.getElementById("specifications")?.value.trim() || "";


    const source =
        document.querySelector(
            'input[name="productSource"]:checked'
        );

    roadmapData.productSource =
        source ? source.value : "";


    return (
        roadmapData.productName &&
        roadmapData.productCategory &&
        roadmapData.intendedUse
    );
}


/* ============================================================
   SAVE STEP 2
============================================================ */

function saveStep2() {

    roadmapData.knowsStandard =
        document.getElementById("standardInput")?.value || "";

    roadmapData.standardNumber =
        document.getElementById("standardNumber")?.value.trim() || "";


    if (!roadmapData.knowsStandard) {

        return false;

    }


    if (
        roadmapData.knowsStandard === "yes" &&
        !roadmapData.standardNumber
    ) {

        return false;

    }


    return true;
}


/* ============================================================
   SAVE STEP 3
============================================================ */

function saveStep3() {

    roadmapData.technicalCompliance =
        document.getElementById(
            "technicalCompliance"
        )?.value || "";

    roadmapData.testReports =
        document.getElementById(
            "testReports"
        )?.value || "";


    return (
        roadmapData.technicalCompliance &&
        roadmapData.testReports
    );
}


/* ============================================================
   SAVE STEP 4
============================================================ */

function saveStep4() {

    roadmapData.preparation = [];


    document
        .querySelectorAll(
            '#prepareForm input[type="checkbox"]:checked'
        )
        .forEach(function (checkbox) {

            roadmapData.preparation.push(
                checkbox.value
            );

        });


    return true;
}


/* ============================================================
   SAVE DATA
============================================================ */

function saveRoadmapData() {

    localStorage.setItem(
        "bisSahayakRoadmap",
        JSON.stringify(roadmapData)
    );

}


/* ============================================================
   SHOW CORRECT FORM
============================================================ */

function showStepForm(step) {

    if (roadmapForm) {
        roadmapForm.style.display = "none";
    }

    if (standardForm) {
        standardForm.style.display = "none";
    }

    if (complianceForm) {
        complianceForm.style.display = "none";
    }

    if (prepareForm) {
        prepareForm.style.display = "none";
    }

    if (roadmapResult) {
        roadmapResult.style.display = "none";
    }


    if (step === 1 && roadmapForm) {

        roadmapForm.style.display = "block";

    }

    else if (step === 2 && standardForm) {

        standardForm.style.display = "block";

    }

    else if (step === 3 && complianceForm) {

        complianceForm.style.display = "block";

    }

    else if (step === 4 && prepareForm) {

        prepareForm.style.display = "block";

    }

    else if (step === 5 && roadmapResult) {

        roadmapResult.style.display = "block";

        generateResult();

    }

}


/* ============================================================
   UPDATE ROADMAP UI
============================================================ */

function updateRoadmap() {

    const stepData =
        steps[currentStep - 1];


    const percentage =
        currentStep * 20;


    /* ---------------------------------------------
       Progress
    --------------------------------------------- */

    if (progressTitle) {

        progressTitle.textContent =
            `Step ${currentStep} of 5`;

    }


    if (progressPercent) {

        progressPercent.textContent =
            `${percentage}%`;

    }


    if (progressFill) {

        progressFill.style.width =
            `${percentage}%`;

    }


    /* ---------------------------------------------
       Content
    --------------------------------------------- */

    if (contentStep) {

        contentStep.textContent =
            `STEP 0${currentStep}`;

    }


    if (contentTitle) {

        contentTitle.textContent =
            stepData.title;

    }


    if (contentDescription) {

        contentDescription.textContent =
            stepData.description;

    }


    if (visualNumber) {

        visualNumber.textContent =
            `0${currentStep}`;

    }


    /* ---------------------------------------------
       Roadmap step state
    --------------------------------------------- */

    roadmapSteps.forEach(function (step, index) {

        const stepNumber =
            index + 1;


        step.classList.remove(
            "active",
            "completed"
        );


        if (stepNumber === currentStep) {

            step.classList.add("active");

        }


        if (stepNumber < currentStep) {

            step.classList.add("completed");

        }

    });


    /* ---------------------------------------------
       Roadmap line
    --------------------------------------------- */

    if (roadmapLineFill) {

        roadmapLineFill.style.width =
            `${((currentStep - 1) / 4) * 100}%`;

    }


    /* ---------------------------------------------
       Buttons
    --------------------------------------------- */

    if (previousBtn) {

        previousBtn.disabled =
            currentStep === 1;

    }


    if (nextBtn) {

        if (currentStep === 5) {

            nextBtn.textContent =
                "Finish ✓";

        }

        else {

            nextBtn.textContent =
                "Next Step →";

        }

    }


    showStepForm(currentStep);

}


/* ============================================================
   VALIDATION
============================================================ */

function validateCurrentStep() {

    if (currentStep === 1) {

        if (!saveStep1()) {

            alert(
                "Please complete the required product information before continuing."
            );

            return false;

        }

    }


    else if (currentStep === 2) {

        if (!saveStep2()) {

            alert(
                "Please provide the required standard information."
            );

            return false;

        }

    }


    else if (currentStep === 3) {

        if (!saveStep3()) {

            alert(
                "Please answer all compliance questions."
            );

            return false;

        }

    }


    else if (currentStep === 4) {

        saveStep4();

    }


    saveRoadmapData();

    return true;

}


/* ============================================================
   GENERATE FINAL RESULT
============================================================ */

function generateResult() {

    if (!resultText) {

        return;

    }


    let result =
        `Product: ${roadmapData.productName || "Not provided"}. `;


    if (roadmapData.productCategory) {

        result +=
            `Category: ${roadmapData.productCategory}. `;

    }


    if (roadmapData.standardNumber) {

        result +=
            `Applicable standard provided: ${roadmapData.standardNumber}. `;

    }

    else {

        result +=
            `The Standard Finder should be used to identify the applicable standard. `;

    }


    result +=
        "The Compliance Checker can then be used to review the applicable requirements.";


    resultText.textContent =
        result;

}


/* ============================================================
   SHOW FINAL CERTIFICATION SUMMARY
============================================================ */

function showFinalSummary() {

    /* Save latest data */

    saveRoadmapData();


    /* Fill summary information */

    if (summaryProduct) {

        summaryProduct.textContent =
            roadmapData.productName ||
            "Not provided";

    }


    if (summaryCategory) {

        summaryCategory.textContent =
            roadmapData.productCategory ||
            "Not provided";

    }


    if (summaryStandard) {

        if (
            roadmapData.knowsStandard === "yes" &&
            roadmapData.standardNumber
        ) {

            summaryStandard.textContent =
                roadmapData.standardNumber;

        }

        else {

            summaryStandard.textContent =
                "To be determined";

        }

    }


    /* Hide assessment card */

    const stepCard =
        document.querySelector(".step-content-card");

    if (stepCard) {

        stepCard.style.display = "none";

    }


    /* Show final summary */

    if (finalSummary) {

        finalSummary.classList.add("show");

        setTimeout(function () {

            finalSummary.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);

    }

}


/* ============================================================
   NEXT BUTTON
============================================================ */

if (nextBtn) {

    nextBtn.addEventListener(
        "click",
        function () {

            /* ---------------------------------------------
               Steps 1-4
            --------------------------------------------- */

            if (currentStep < 5) {

                if (!validateCurrentStep()) {

                    return;

                }


                currentStep++;


                updateRoadmap();


                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });


                return;

            }


            /* ---------------------------------------------
               STEP 5 → FINISH
            --------------------------------------------- */

            showFinalSummary();

        }
    );

}


/* ============================================================
   PREVIOUS BUTTON
============================================================ */

if (previousBtn) {

    previousBtn.addEventListener(
        "click",
        function () {

            if (currentStep > 1) {

                currentStep--;


                updateRoadmap();


                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }

        }
    );

}


/* ============================================================
   ROADMAP STEP BUTTONS
============================================================ */

roadmapSteps.forEach(function (step) {

    step.addEventListener(
        "click",
        function () {

            const requestedStep =
                Number(
                    step.getAttribute("data-step")
                );


            /*
             * Don't allow jumping into future steps.
             */

            if (
                requestedStep > currentStep
            ) {

                return;

            }


            currentStep =
                requestedStep;


            updateRoadmap();

        }
    );

});


/* ============================================================
   STANDARD INPUT
============================================================ */

const standardInput =
    document.getElementById("standardInput");

const standardNumberGroup =
    document.getElementById(
        "standardNumberGroup"
    );


if (standardInput) {

    standardInput.addEventListener(
        "change",
        function () {

            if (!standardNumberGroup) {

                return;

            }


            if (
                standardInput.value === "yes"
            ) {

                standardNumberGroup.style.display =
                    "flex";

            }

            else {

                standardNumberGroup.style.display =
                    "none";

            }

        }
    );

}


/* ============================================================
   START NEW ASSESSMENT
============================================================ */

if (newAssessmentBtn) {

    newAssessmentBtn.addEventListener(
        "click",
        function () {

            /* Reset data */

            roadmapData.productName = "";
            roadmapData.productCategory = "";
            roadmapData.intendedUse = "";
            roadmapData.specifications = "";
            roadmapData.productSource = "";

            roadmapData.knowsStandard = "";
            roadmapData.standardNumber = "";

            roadmapData.technicalCompliance = "";
            roadmapData.testReports = "";

            roadmapData.preparation = [];


            /* Reset form fields */

            const form =
                document.querySelector(
                    ".step-content-card"
                );


            if (form) {

                form
                    .querySelectorAll(
                        "input, textarea, select"
                    )
                    .forEach(function (element) {

                        if (
                            element.type === "radio" ||
                            element.type === "checkbox"
                        ) {

                            element.checked = false;

                        }

                        else {

                            element.value = "";

                        }

                    });

            }


            /* Reset standard number field */

            if (standardNumberGroup) {

                standardNumberGroup.style.display =
                    "none";

            }


            /* Remove saved data */

            localStorage.removeItem(
                "bisSahayakRoadmap"
            );


            /* Show assessment again */

            const stepCard =
                document.querySelector(
                    ".step-content-card"
                );

            if (stepCard) {

                stepCard.style.display =
                    "grid";

            }


            /* Hide summary */

            if (finalSummary) {

                finalSummary.classList.remove(
                    "show"
                );

            }


            /* Reset step */

            currentStep = 1;


            updateRoadmap();


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


/* ============================================================
   BACK TO HOME
============================================================ */

if (summaryHomeBtn) {

    summaryHomeBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";

        }
    );

}


/* ============================================================
   SIDEBAR
============================================================ */

function openSidebar() {

    if (sidebar) {

        sidebar.classList.add(
            "sidebar-open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "show"
        );

    }

}


function closeSidebar() {

    if (sidebar) {

        sidebar.classList.remove(
            "sidebar-open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "show"
        );

    }

}


if (hamburger) {

    hamburger.addEventListener(
        "click",
        openSidebar
    );

}


if (closeMenu) {

    closeMenu.addEventListener(
        "click",
        closeSidebar
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


/* ============================================================
   LANGUAGE MENU
============================================================ */

if (languageBtn && languageMenu) {

    languageBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            languageMenu.classList.toggle(
                "show"
            );

        }
    );


    languageMenu
        .querySelectorAll("button")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const language =
                        button.getAttribute(
                            "data-language"
                        );


                    const languageText =
                        languageBtn.querySelector(
                            "span"
                        );


                    if (languageText) {

                        languageText.textContent =
                            language;

                    }


                    languageMenu.classList.remove(
                        "show"
                    );

                }
            );

        });


    document.addEventListener(
        "click",
        function (event) {

            if (
                !languageMenu.contains(event.target) &&
                !languageBtn.contains(event.target)
            ) {

                languageMenu.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* ============================================================
   INITIALIZE
============================================================ */

updateRoadmap();