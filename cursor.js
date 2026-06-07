document.addEventListener("DOMContentLoaded", () => {
    // Check if custom cursor container exists, if not create it
    let customCursor = document.getElementById("leaf-cursor") || document.querySelector(".custom-cursor");
    
    if (!customCursor) {
        customCursor = document.createElement("div");
        customCursor.id = "leaf-cursor";
        customCursor.className = "custom-cursor";
        document.body.appendChild(customCursor);
    }

    // Set standard class and structure
    customCursor.className = "custom-cursor";
    customCursor.innerHTML = '<div class="cursor-plus"></div>';

    // Inject global styles to override and unify cursor aesthetics
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
        /* Force hide system cursor except on inputs */
        html, body, a, button, [role='button'], select, option {
            cursor: none !important;
        }
        
        .custom-cursor {
            width: 38px;
            height: 38px;
            position: fixed;
            pointer-events: none;
            z-index: 99999;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s ease, transform 0.15s ease;
        }
        
        .custom-cursor.active {
            opacity: 1;
        }
        
        .cursor-plus {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(13,148,136,0.10);
            box-shadow: 0 0 16px rgba(13, 148, 136, 0.18);
            backdrop-filter: blur(6px);
        }
        .cursor-plus::before,
        .cursor-plus::after {
            content: '';
            position: absolute;
            width: 2.8px;
            height: 12px;
            background: #0D9488;
            border-radius: 999px;
            box-shadow: 0 0 8px rgba(13,148,136,0.75);
        }
        .cursor-plus::before { transform: rotate(0deg); }
        .cursor-plus::after { transform: rotate(90deg); }
        
        .custom-cursor.hovering {
            transform: translate(-50%, -50%) scale(1.1);
        }
        .custom-cursor.hovering .cursor-plus {
            background: rgba(13,148,136,0.16);
            box-shadow: 0 0 20px rgba(13, 148, 136, 0.28);
        }
        
        .custom-cursor.hide-custom-cursor {
            opacity: 0 !important;
            pointer-events: none;
        }
    `;
    document.head.appendChild(styleEl);

    // Track mouse movement
    document.addEventListener("mousemove", (e) => {
        customCursor.style.left = `${e.clientX}px`;
        customCursor.style.top = `${e.clientY}px`;
        if (!customCursor.classList.contains("active")) {
            customCursor.classList.add("active");
        }
    });

    // Handle mouse leaving window
    document.addEventListener("mouseleave", () => {
        customCursor.classList.remove("active");
    });

    // Standard Hover Behavior for interactive elements
    function setupHoverListeners() {
        const interactiveElements = document.querySelectorAll("a, button, [role='button'], .group");
        interactiveElements.forEach((element) => {
            element.addEventListener("mouseenter", () => {
                customCursor.classList.add("hovering");
            });
            element.addEventListener("mouseleave", () => {
                customCursor.classList.remove("hovering");
            });
        });

        // Hide custom cursor on text inputs and use normal typing caret
        const inputElements = document.querySelectorAll("input, textarea, select, [contenteditable='true']");
        inputElements.forEach((input) => {
            input.addEventListener("mouseenter", () => {
                customCursor.classList.add("hide-custom-cursor");
                document.body.style.cursor = "text"; 
            });
            input.addEventListener("mouseleave", () => {
                customCursor.classList.remove("hide-custom-cursor");
                document.body.style.cursor = "none";
            });
        });
    }

    setupHoverListeners();

    // Re-run listener setup on dynamic DOM changes (e.g. category filters)
    const observer = new MutationObserver(setupHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });
});