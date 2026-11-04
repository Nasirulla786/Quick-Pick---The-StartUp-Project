import Trip from "../model/trip.model.js";



// 1. CREATE TRIP
export const createTrip = async (req, res) => {
  try {
    const {
      from,
      to,
      departureDate,
      departureTime,
      transportMode,
      availableCapacity,
      pricePerKg,
      description,
    } = req.body;

    if (
      !from ||
      !to ||
      !departureDate ||
      !departureTime ||
      !transportMode ||
      availableCapacity == null ||
      pricePerKg == null
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Source and destination cannot be same",
      });
    }

    if (
      !Number.isFinite(Number(availableCapacity)) ||
      Number(availableCapacity) <= 0 ||
      !Number.isFinite(Number(pricePerKg)) ||
      Number(pricePerKg) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid capacity or price",
      });
    }

    const trip = await Trip.create({
      traveller: req.userId,
      from: from.trim(),
      to: to.trim(),
      departureDate,
      departureTime,
      transportMode,
      availableCapacity,
      pricePerKg,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Trip created successfully",
      trip,
    });

  } catch (error) {
    console.log("Create trip error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create trip",
    });
  }
};


// 2. GET ALL AVAILABLE TRIPS
export const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      status: "available",
      departureDate: { $gte: new Date() },
    })
      .sort({ departureDate: 1 });

    return res.status(200).json({
      success: true,
      totalTrips: trips.length,
      trips,
    });

  } catch (error) {
    console.log("Get all trips error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trips",
    });
  }
};


// 3. GET MY TRIPS
export const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      traveller: req.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalTrips: trips.length,
      trips,
    });

  } catch (error) {
    console.log("Get my trips error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your trips",
    });
  }
};


// 4. GET SINGLE TRIP
export const getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    return res.status(200).json({
      success: true,
      trip,
    });

  } catch (error) {
    console.log("Get trip error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trip",
    });
  }
};


// 5. SEARCH TRIPS
export const searchTrips = async (req, res) => {
  try {
    const { from, to, departureDate } = req.query;

    const filter = {
      status: "available",
      departureDate: { $gte: new Date() },
    };

    if (from) {
      filter.from = {
        $regex: from,
        $options: "i",
      };
    }

    if (to) {
      filter.to = {
        $regex: to,
        $options: "i",
      };
    }

    if (departureDate) {
      const startDate = new Date(departureDate);

      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid departure date",
        });
      }

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      filter.departureDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const trips = await Trip.find(filter)
      .sort({ departureDate: 1 });

    return res.status(200).json({
      success: true,
      totalTrips: trips.length,
      trips,
    });

  } catch (error) {
    console.log("Search trips error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search trips",
    });
  }
};


// 6. UPDATE TRIP
export const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Check trip ownership
    if (trip.traveller.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this trip",
      });
    }

    const allowedFields = [
      "from",
      "to",
      "departureDate",
      "departureTime",
      "transportMode",
      "availableCapacity",
      "pricePerKg",
      "description",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        trip[field] = req.body[field];
      }
    });

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      trip,
    });

  } catch (error) {
    console.log("Update trip error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update trip",
    });
  }
};


// 7. DELETE TRIP
export const deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Check trip ownership
    if (trip.traveller.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this trip",
      });
    }

    await trip.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });

  } catch (error) {
    console.log("Delete trip error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete trip",
    });
  }
};
