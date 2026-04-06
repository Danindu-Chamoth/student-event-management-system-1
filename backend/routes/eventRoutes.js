const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const upload = require("../middleware/upload");

// Create event
router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      // If it's a multer error (e.g. not multipart), just continue without a file. 
      // The body parser will handle the JSON instead.
      return next(); 
    }
    next();
  });
}, eventController.createEvent);

// Get all events
router.get("/", eventController.getEvents);

// Update event
router.put("/:id", upload.single("image"), eventController.updateEvent);

// Delete event
router.delete("/:id", eventController.deleteEvent);

module.exports = router;