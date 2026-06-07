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
    customCursor.innerHTML = '<div class="pulse-dot"></div><div class="pulse-ring"></div>';

    // Inject global styles to override and unify cursor aesthetics
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
        /* Force hide system cursor except on inputs */
        html, body, a, button, [role='button'], select, option {
            cursor: none !important;
        }
        
        .custom-cursor {
            width: 32px;
            height: 32px;
            position: fixed;
            pointer-events: none;
            z-index: 99999;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        /* Show custom cursor once mouse moves */
        .custom-cursor.active {
            opacity: 1;
        }
        
        .pulse-dot {
            width: 6px;
            height: 6px;
            background-color: #0D9488; /* Medical Teal */
            border-radius: 50%;
            position: absolute;
            box-shadow: 0 0 10px rgba(13, 148, 136, 0.8);
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s;
        }
        
        .pulse-ring {
            width: 24px;
            height: 24px;
            border: 1.5px solid #06B6D4; /* Medical Cyan */
            border-radius: 50%;
            position: absolute;
            box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
            animation: bioPulse 2.2s infinite ease-in-out;
            transition: width 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                        height 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                        border-color 0.25s, box-shadow 0.25s;
        }
        
        .custom-cursor.hovering .pulse-dot {
            transform: scale(1.6);
            background-color: #10B981; /* Active Mint */
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.8);
        }
        
        .custom-cursor.hovering .pulse-ring {
            width: 36px;
            height: 36px;
            border-color: #10B981; /* Active Mint */
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
        }
        
        .custom-cursor.hide-custom-cursor {
            opacity: 0 !important;
            pointer-events: none;
        }
        
        @keyframes bioPulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.15); opacity: 0.4; }
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