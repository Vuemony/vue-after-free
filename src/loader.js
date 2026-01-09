// Load binloader first (just defines the function, doesn't execute)

// Now load userland and lapse
if (typeof libc_addr === 'undefined') {
    include('userland.js')
}

include('binloader.js')
include('lapse.js')

// Check if lapse.js has completed successfully
function is_lapse_complete() {
    // Check if libc_addr is defined


    // Check if kernel object exists with read/write functions
    if (typeof kernel === 'undefined' || !kernel.read_qword || !kernel.write_qword) {
        return false;
    }

    // Check if we're actually jailbroken
    if (typeof getuid !== 'undefined' && typeof is_in_sandbox !== 'undefined') {
        try {
            var uid = getuid();
            var sandbox = is_in_sandbox();
            // Should be root (uid=0) and not sandboxed (0)
            if (!uid.eq(0) || !sandbox.eq(0)) {
                return false;
            }
        } catch(e) {
            return false;
        }
    }

    return true;
}

// Wait for lapse to complete, then load binloader
log("Waiting for lapse.js to complete...");
var start_time = Date.now();
var max_wait_seconds = 60;
var max_wait_ms = max_wait_seconds * 1000;

while (!is_lapse_complete()) {
    var elapsed = Date.now() - start_time;

    if (elapsed > max_wait_ms) {
        log("ERROR: Timeout waiting for lapse.js to complete (" + max_wait_seconds + " seconds)");
        throw new Error("Lapse timeout");
    }

    // Poll every 500ms
    var poll_start = Date.now();
    while (Date.now() - poll_start < 500) {
        // Busy wait
    }
}

var total_wait = ((Date.now() - start_time) / 1000).toFixed(1);
log("Lapse completed successfully after " + total_wait + " seconds");
log("Initializing binloader...");

try {
    binloader_init();
    log("Binloader initialized and running!");
} catch(e) {
    log("ERROR: Failed to initialize binloader");
    log("Error message: " + e.message);
    log("Error name: " + e.name);
    if (e.stack) {
        log("Stack trace: " + e.stack);
    }
    throw e;
}
