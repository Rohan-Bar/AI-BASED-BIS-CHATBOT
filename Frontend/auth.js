document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       EMAIL VALIDATION
    ===================================================== */

    function isValidEmail(email) {

        const emailPattern =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        return emailPattern.test(email.trim());
    }


    /* =====================================================
       PASSWORD SHOW / HIDE
    ===================================================== */

    function setupPasswordToggle(inputId, buttonId) {

        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);

        if (!input || !button) {
            return;
        }

        button.addEventListener("click", function () {

            if (input.type === "password") {

                input.type = "text";

                button.textContent = "🙈";
                button.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                input.type = "password";

                button.textContent = "👁";
                button.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }

        });
    }


    /* Login */

    setupPasswordToggle(
        "loginPassword",
        "loginEye"
    );


    /* Signup */

    setupPasswordToggle(
        "signupPassword",
        "signupEye"
    );


    /* Confirm password */

    setupPasswordToggle(
        "confirmPassword",
        "confirmEye"
    );



    /* =====================================================
       LOGIN FORM
    ===================================================== */

    const loginForm =
        document.getElementById("loginForm");


    if (loginForm) {

        const email =
            document.getElementById("loginEmail");

        const password =
            document.getElementById("loginPassword");

        const emailError =
            document.getElementById("loginEmailError");

        const passwordError =
            document.getElementById("loginPasswordError");


        loginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                /* Clear errors */

                emailError.textContent = "";
                passwordError.textContent = "";


                let isValid = true;


                /* ==============================
                   EMAIL
                ============================== */

                if (email.value.trim() === "") {

                    emailError.textContent =
                        "Please enter your email.";

                    isValid = false;

                }

                else if (!isValidEmail(email.value)) {

                    emailError.textContent =
                        "Please enter a valid email address.";

                    isValid = false;
                }


                /* ==============================
                   PASSWORD
                ============================== */

                if (password.value.trim() === "") {

                    passwordError.textContent =
                        "Please enter your password.";

                    isValid = false;
                }


                /* ==============================
                   LOGIN SUCCESS
                ============================== */

                if (isValid) {

    try {
        await apiLogin(email.value.trim(), password.value);
        alert("Login successful!");
        window.location.href = "index.html";
    } catch (err) {
        alert(err.message);
    }
}


            }
        );



        /* =================================================
           FORGOT PASSWORD
        ================================================= */

        const forgotPassword =
            document.querySelector(".forgot-password");


        if (forgotPassword) {

            forgotPassword.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    alert(
                        "Password recovery will be available soon."
                    );

                }
            );
        }

    }



    /* =====================================================
       SIGNUP FORM
    ===================================================== */

    const signupForm =
        document.getElementById("signupForm");


    if (signupForm) {

        const name =
            document.getElementById("name");

        const email =
            document.getElementById("signupEmail");

        const password =
            document.getElementById("signupPassword");

        const confirmPassword =
            document.getElementById("confirmPassword");


        const emailError =
            document.getElementById("signupEmailError");

        const confirmError =
            document.getElementById("confirmError");


        const strengthBar =
            document.getElementById("strengthBar");

        const strengthText =
            document.getElementById("strengthText");


        /* =================================================
           PASSWORD REQUIREMENTS
        ================================================= */

        const lengthRequirement =
            document.getElementById("length");

        const numberRequirement =
            document.getElementById("number");

        const lowercaseRequirement =
            document.getElementById("lowercase");

        const uppercaseRequirement =
            document.getElementById("uppercase");

        const specialRequirement =
            document.getElementById("special");



        /* =================================================
           UPDATE REQUIREMENT
        ================================================= */

        function updateRequirement(
            element,
            condition
        ) {

            if (!element) {
                return;
            }

            const icon =
                element.querySelector("span");


            if (condition) {

                element.classList.add("valid");

                if (icon) {
                    icon.textContent = "✓";
                }

            } else {

                element.classList.remove("valid");

                if (icon) {
                    icon.textContent = "✕";
                }
            }
        }



        /* =================================================
           PASSWORD STRENGTH
        ================================================= */

        function checkPasswordStrength(value) {

            const hasLength =
                value.length >= 8;

            const hasNumber =
                /[0-9]/.test(value);

            const hasLowercase =
                /[a-z]/.test(value);

            const hasUppercase =
                /[A-Z]/.test(value);

            const hasSpecial =
                /[@!*$~]/.test(value);


            /* Update requirements */

            updateRequirement(
                lengthRequirement,
                hasLength
            );

            updateRequirement(
                numberRequirement,
                hasNumber
            );

            updateRequirement(
                lowercaseRequirement,
                hasLowercase
            );

            updateRequirement(
                uppercaseRequirement,
                hasUppercase
            );

            updateRequirement(
                specialRequirement,
                hasSpecial
            );


            /* Calculate score */

            let score = 0;

            if (hasLength) score++;
            if (hasNumber) score++;
            if (hasLowercase) score++;
            if (hasUppercase) score++;
            if (hasSpecial) score++;


            /* Empty */

            if (value.length === 0) {

                strengthBar.style.width = "0%";

                strengthText.textContent = "Weak";

                strengthText.style.color =
                    "#ef4444";

                return;
            }


            /* Weak */

            if (score <= 2) {

                strengthBar.style.width = "25%";

                strengthBar.style.background =
                    "#ef4444";

                strengthText.textContent =
                    "Weak";

                strengthText.style.color =
                    "#ef4444";
            }


            /* Medium */

            else if (score <= 4) {

                strengthBar.style.width = "60%";

                strengthBar.style.background =
                    "#f59e0b";

                strengthText.textContent =
                    "Medium";

                strengthText.style.color =
                    "#f59e0b";
            }


            /* Strong */

            else {

                strengthBar.style.width = "100%";

                strengthBar.style.background =
                    "#16a34a";

                strengthText.textContent =
                    "Strong";

                strengthText.style.color =
                    "#16a34a";
            }

        }



        /* =================================================
           PASSWORD INPUT
        ================================================= */

        password.addEventListener(
            "input",
            function () {

                checkPasswordStrength(
                    password.value
                );


                /* Check confirm password */

                if (
                    confirmPassword.value.length > 0
                ) {

                    if (
                        password.value ===
                        confirmPassword.value
                    ) {

                        confirmError.textContent = "";

                    } else {

                        confirmError.textContent =
                            "Passwords do not match.";
                    }
                }

            }
        );



        /* =================================================
           CONFIRM PASSWORD
        ================================================= */

        confirmPassword.addEventListener(
            "input",
            function () {

                if (
                    confirmPassword.value ===
                    password.value
                ) {

                    confirmError.textContent = "";

                } else {

                    confirmError.textContent =
                        "Passwords do not match.";
                }

            }
        );



        /* =================================================
           SIGNUP FORM
        ================================================= */

        signupForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                /* Clear errors */

                emailError.textContent = "";
                confirmError.textContent = "";


                let isValid = true;


                /* ==============================
                   NAME
                ============================== */

                if (name.value.trim() === "") {

                    alert(
                        "Please enter your full name."
                    );

                    isValid = false;
                }


                /* ==============================
                   EMAIL
                ============================== */

                if (email.value.trim() === "") {

                    emailError.textContent =
                        "Please enter your email.";

                    isValid = false;

                }

                else if (!isValidEmail(email.value)) {

                    emailError.textContent =
                        "Please enter a valid email address.";

                    isValid = false;
                }


                /* ==============================
                   PASSWORD
                ============================== */

                const passwordValid =
                    password.value.length >= 8 &&
                    /[0-9]/.test(password.value) &&
                    /[a-z]/.test(password.value) &&
                    /[A-Z]/.test(password.value) &&
                    /[@!*$~]/.test(password.value);


                if (!passwordValid) {

                    alert(
                        "Please meet all password requirements."
                    );

                    isValid = false;
                }


                /* ==============================
                   CONFIRM PASSWORD
                ============================== */

                if (
                    password.value !==
                    confirmPassword.value
                ) {

                    confirmError.textContent =
                        "Passwords do not match.";

                    isValid = false;
                }


                /* ==============================
                   SUCCESS
                ============================== */

                if (isValid) {

                    alert(
                        "Account created successfully!"
                    );

                    /*
                     * Temporary frontend behaviour.
                     *
                     * Later:
                     * FastAPI + database
                     */

                    window.location.href =
                        "login.html";
                }

            }
        );

    }

});