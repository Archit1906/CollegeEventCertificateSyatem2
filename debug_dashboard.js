console.log("Checking dashboard status...");
if (typeof StudentDashboardManager !== 'undefined') {
    try {
        StudentDashboardManager.init();
        console.log("Forced init ran successfully.");
    } catch (e) {
        console.error("Error running init:", e);
    }
} else {
    console.error("StudentDashboardManager is not defined.");
}
