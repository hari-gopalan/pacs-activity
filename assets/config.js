/* PACS Kano — configuration
   1. Deploy apps-script/Code.gs as a Web App (see README.md) and paste the
      resulting URL below.
   2. Change INSTRUCTOR_PASSWORD if you want something other than the default.

   IMPORTANT: this is a static site. Anything in this file — including the
   password — ships in plain text to every visitor's browser and can be read
   via "View Source". It keeps casual students from poking at the instructor
   view; it is NOT real authentication and should never guard anything
   actually sensitive. */

// Keep the quotes around the URL below when you paste a new deployment in --
// without them this line is invalid JavaScript, which silently breaks this
// whole file (both pages then quietly fall back to browser-only storage,
// with no visible error, since nothing here throws on a missing constant).
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykJbdAqxYBzXukQHd0q8K8_vbLtbYdeapG-jA6ypHDsUrMwGmhqZJTQS0uv4fb0oS9EQ/exec";
const INSTRUCTOR_PASSWORD = "harigopalan";
