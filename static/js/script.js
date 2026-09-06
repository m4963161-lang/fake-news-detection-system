/**
 * FakeDetect - Client-side Interaction JavaScript
 */

document.addEventListener("DOMContentLoaded", function () {
    // 1. Mobile Sidebar Toggle
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener("click", function (e) {
            e.stopPropagation();
            sidebar.classList.toggle("show");
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener("click", function (e) {
            if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove("show");
            }
        });
    }

    // 2. Character Counter & Input Handling
    const newsText = document.getElementById("newsText");
    const charCount = document.getElementById("charCount");
    const charCounterBadge = document.getElementById("charCounterBadge");
    const clearBtn = document.getElementById("clearBtn");
    const submitBtn = document.getElementById("submitBtn");

    if (newsText && charCount) {
        function updateCounter() {
            const length = newsText.value.length;
            charCount.textContent = length;

            if (length > 4500) {
                charCounterBadge.classList.add("bg-warning-subtle", "text-warning");
            } else {
                charCounterBadge.classList.remove("bg-warning-subtle", "text-warning");
            }
        }

        newsText.addEventListener("input", updateCounter);
        newsText.addEventListener("keyup", updateCounter);

        if (clearBtn) {
            clearBtn.addEventListener("click", function () {
                newsText.value = "";
                updateCounter();
                newsText.focus();
            });
        }
    }

    // 3. Quick Sample Buttons
    const sampleButtons = document.querySelectorAll(".sample-btn");
    sampleButtons.forEach(button => {
        button.addEventListener("click", function () {
            const sampleText = this.getAttribute("data-sample");
            if (newsText && sampleText) {
                newsText.value = sampleText;
                if (charCount) {
                    charCount.textContent = sampleText.length;
                }
                newsText.focus();
                // Smooth scroll to textarea
                newsText.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    });

    // 4. Form Submission Loading State
    const predictionForm = document.getElementById("predictionForm");
    if (predictionForm && submitBtn) {
        predictionForm.addEventListener("submit", function (e) {
            if (!newsText.value.trim()) {
                e.preventDefault();
                alert("Please enter a news headline or article before submitting.");
                newsText.focus();
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Analyzing NLP & Features...';
        });
    }
});
