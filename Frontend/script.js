/* ============================================================
   1. SIDEBAR (HAMBURGER) TOGGLE
============================================================ */

const sidebar = document.querySelector(".left_border");
const hamburger = document.querySelector(".hamburger");
const closeMenuBtn = document.querySelector(".close-menu");
const sidebarOverlay = document.querySelector(".sidebar-overlay");


function openSidebar() {

    if (!sidebar) return;

    sidebar.classList.add("sidebar-open");

    if (sidebarOverlay) {
        sidebarOverlay.classList.add("overlay-open");
    }

    document.body.style.overflow = "hidden";
}


function closeSidebar() {

    if (!sidebar) return;

    sidebar.classList.remove("sidebar-open");

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("overlay-open");
    }

    document.body.style.overflow = "";
}


/* Open sidebar */

if (hamburger) {

    hamburger.addEventListener("click", function (e) {

        e.preventDefault();
        e.stopPropagation();

        openSidebar();

    });

}


/* Close using X button */

if (closeMenuBtn) {

    closeMenuBtn.addEventListener("click", function (e) {

        e.preventDefault();
        e.stopPropagation();

        closeSidebar();

    });

}


/* Close when clicking overlay */

if (sidebarOverlay) {

    sidebarOverlay.addEventListener("click", function () {

        closeSidebar();

    });

}


/* Close with Escape key */

document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {

        closeSidebar();

    }

});


/* Close when a sidebar menu link is clicked */

document.querySelectorAll(".left_border a").forEach(function (link) {

    link.addEventListener("click", function () {

        closeSidebar();

    });

});


/* ============================================================
   2. LANGUAGE DROPDOWN
============================================================ */

const languageBtn = document.querySelector(".language-btn");
const languageMenu = document.querySelector(".language-menu");
const languageText = document.querySelector(".language-text");


if (languageBtn && languageMenu) {

    languageBtn.addEventListener("click", function (e) {

        e.preventDefault();
        e.stopPropagation();

        languageMenu.classList.toggle("open");

    });


    document.querySelectorAll(".language-option").forEach(function (option) {

        option.addEventListener("click", function () {

            const selected = option.getAttribute("data-language");

            if (languageText) {

                languageText.textContent = selected;

            }

            languageMenu.classList.remove("open");

        });

    });


    /* Close language dropdown outside */

    document.addEventListener("click", function (e) {

        if (
            !languageMenu.contains(e.target) &&
            !languageBtn.contains(e.target)
        ) {

            languageMenu.classList.remove("open");

        }

    });

}


/* =========================================================
   7. CHATBOT
========================================================= */


/* =========================================================
   CHAT ELEMENTS
========================================================= */

const chatInput =
    document.querySelector(".chat-input");

const sendBtn =
    document.querySelector(".send-btn");

const chatMessages =
    document.querySelector(".chat-messages");


/* =========================================================
   ATTACHMENT ELEMENTS
========================================================= */

const plusBtn =
    document.querySelector(".plus-btn");

const uploadPopup =
    document.querySelector(".upload-popup");


/* =========================================================
   BOT RESPONSE — real backend AI (Groq + RAG)
========================================================= */

async function getBotReply(userMessage) {

    try {

        const data = await apiChat(userMessage);

        /* The backend returns { answer, sources } */

        let reply = data.answer;

        /* Attach sources as citation text */

        if (data.sources && data.sources.length > 0) {

            reply += "\n\n📚 Sources:";

            data.sources.slice(0, 3).forEach(s => {

                reply += "\n• " + s.standard +
                    (s.page ? " (page " + s.page + ")" : "");
            });
        }

        return reply;

    } catch (err) {

        return "⚠️ " + err.message;
    }
}


/* =========================================================
   ADD CHAT MESSAGE
========================================================= */

function addChatMessage(text, type) {

    if (!chatMessages) {
        return;
    }


    const message =
        document.createElement("div");


    message.className =
        "chat-message " + type;


    message.textContent =
        text;


    chatMessages.appendChild(message);


    /* Always show newest message */

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* =========================================================
   TYPING INDICATOR
========================================================= */

function showTypingIndicator() {

    if (!chatMessages) {
        return null;
    }


    const typing =
        document.createElement("div");


    typing.className =
        "typing-indicator";


    typing.textContent =
        "BIS-Sahayak is typing...";


    chatMessages.appendChild(typing);


    chatMessages.scrollTop =
        chatMessages.scrollHeight;


    return typing;
}

/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (
        !chatInput ||
        !chatMessages
    ) {
        return;
    }


    const message =
        chatInput.value.trim();


    /* Don't send empty message */

    if (message === "") {
        return;
    }


    /* USER MESSAGE */

    addChatMessage(
        message,
        "user-message"
    );


    /* Clear input */

    chatInput.value = "";


    /* Typing indicator (stays visible while AI thinks) */

    const typing =
        showTypingIndicator();


    try {

        /* REAL backend AI call — await it */

        const reply =
            await getBotReply(message);


        /* Remove typing indicator */

        if (typing) {
            typing.remove();
        }


        addChatMessage(
            reply,
            "bot-message"
        );

    } catch (err) {

        /* Remove typing indicator */

        if (typing) {
            typing.remove();
        }


        addChatMessage(
            "⚠️ " + err.message,
            "bot-message"
        );
    }
}


/* =========================================================
   SEND BUTTON
========================================================= */

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );
}


/* =========================================================
   ENTER KEY
========================================================= */

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();

            }

        }
    );
}


/* ============================================================
   PLUS BUTTON / ATTACHMENT POPUP
============================================================ */

if (plusBtn && uploadPopup) {

    /* Open / close popup */

    plusBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            uploadPopup.classList.toggle("show");

        }
    );


    /* Close popup when clicking outside */

    document.addEventListener(
        "click",
        function (event) {

            if (
                !uploadPopup.contains(event.target) &&
                !plusBtn.contains(event.target)
            ) {

                uploadPopup.classList.remove("show");

            }

        }
    );

}


/* ============================================================
   FILE UPLOAD ELEMENTS
============================================================ */

const imageUpload =
    document.getElementById("imageUpload");

const documentUpload =
    document.getElementById("documentUpload");

const fileUpload =
    document.getElementById("fileUpload");


/* ============================================================
   POPUP OPTIONS
============================================================ */

document
    .querySelectorAll(".popup-option")
    .forEach(function (option) {

        option.addEventListener(
            "click",
            function () {

                const type =
                    option.getAttribute(
                        "data-upload"
                    );


                /* IMAGE */

                if (
                    type === "image" &&
                    imageUpload
                ) {

                    imageUpload.click();

                }


                /* DOCUMENT */

                else if (
                    type === "document" &&
                    documentUpload
                ) {

                    documentUpload.click();

                }


                /* FILE */

                else if (
                    type === "file" &&
                    fileUpload
                ) {

                    fileUpload.click();

                }


                /* Close popup */

                if (uploadPopup) {

                    uploadPopup.classList.remove(
                        "show"
                    );

                }

            }
        );

    });


/* ============================================================
   HANDLE SELECTED FILE
============================================================ */

function handleFileSelected(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    /* Show attachment as user message */

    addChatMessage(
        'Attached: "' + file.name + '"',
        "user-message"
    );


    /* Temporary bot response */

    setTimeout(function () {

        addChatMessage(
            'I received "' +
            file.name +
            '". Upload processing will be available in an upcoming version. Meanwhile you can ask questions about BIS standards.',
            "bot-message"
        );

    }, 800);


    /* Allow same file to be selected again */

    event.target.value = "";

}


/* ============================================================
   FILE INPUT LISTENERS
============================================================ */

[
    imageUpload,
    documentUpload,
    fileUpload

].forEach(function (input) {

    if (input) {

        input.addEventListener(
            "change",
            handleFileSelected
        );

    }

});

/* ============================================================
   6. FOLLOW-UP QUESTION CHIPS
============================================================ */

document.querySelectorAll(".question-chip").forEach(function (chip) {

    chip.addEventListener("click", function () {

        const question = chip.textContent.trim();

        if (!question || !chatInput) {
            return;
        }

        chatInput.value = question;

        chatInput.focus();

        sendMessage();

    });

});


/* ============================================================
   7. FAQ ACCORDION
============================================================ */

document.querySelectorAll(".faqbox").forEach(function (box) {

    const questionEl =
        box.querySelector(".faq-question");


    if (!questionEl) return;


    questionEl.addEventListener("click", function () {


        /* Close other FAQ boxes */

        document.querySelectorAll(
            ".faqbox.active"
        ).forEach(function (openBox) {

            if (openBox !== box) {

                openBox.classList.remove("active");

            }

        });


        /* Open / close current FAQ */

        box.classList.toggle("active");

    });

});


/* ============================================================
   8. SMOOTH SCROLL
============================================================ */

document.querySelectorAll(
    "[data-scroll]"
).forEach(function (link) {

    link.addEventListener("click", function (e) {

        const targetId =
            link.getAttribute("data-scroll");

        const target =
            document.getElementById(targetId);


        if (target) {

            e.preventDefault();


            window.scrollTo({

                top: target.offsetTop - 72,

                behavior: "smooth"

            });

        }

    });

});


/* ============================================================
   9. FEATURE LINKS
============================================================ */

document.querySelectorAll(
    ".assistant-link"
).forEach(function (link) {

    link.addEventListener("click", function (e) {

        e.preventDefault();

        const hero =
            document.getElementById("hero");

        if (hero) {

            hero.scrollIntoView({
                behavior: "smooth"
            });

        }

        if (chatInput) {

            setTimeout(function () {

                chatInput.focus();

            }, 500);

        }

    });

});

