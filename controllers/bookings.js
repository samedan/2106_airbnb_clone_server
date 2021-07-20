const Booking = require("../models/booking");
const Rental = require("../models/rental");
const DAYS_THRESHOLD = 3;
const moment = require("moment");

exports.getBookings = async (req, res) => {
  const { rental } = req.query;
  const query = rental ? Booking.find({ rental }) : Booking.find({});

  try {
    const bookings = await query.select("startAt endAt -_id").exec();
    return res.json(bookings);
  } catch (error) {
    return res.mongoError(error);
  }
};

// Bookings made on Other Peoples Rentals
// /api/v1/bookings/me
exports.getUserBookings = async (req, res) => {
  const { user } = res.locals;
  try {
    const bookings = await Booking.find({ user })
      .populate("user", "-password") // from the booking User
      .populate("rental");
    return res.json(bookings);
  } catch (error) {
    return res.mongoError(error);
  }
};

// Bookings made on My rentals
// /api/v1/bookings/received
exports.getReceivedBookings = async (req, res) => {
  const { user } = res.locals;
  try {
    const rentals = await Rental.find({ owner: user }, "_id"); // only return '_id'
    const rentalIds = rentals.map((r) => r.id); // [id1, id3, ...]
    // look for all the bookings where the 'rental' key is included in the []
    const bookings = await Booking.find({ rental: { $in: rentalIds } })
      .populate("user", "-password")
      .populate("rental");
    return res.json(bookings);
  } catch (error) {
    return res.mongoError(error);
  }
};

exports.createBooking = async (req, res) => {
  const bookingData = req.body;
  const booking = new Booking({ ...bookingData, user: res.locals.user });
  // booking.user = res.locals.user;

  if (!checkIfBookingDatesAreChronological(booking)) {
    return res.sendApiError({
      title: "Invalid booking",
      detail: "Ending date is before Starting date",
    });
  }
  if (!checkIfBookingDatesAreMissing(booking)) {
    return res.sendApiError({
      title: "Invalid booking",
      detail: "Please choose Starting and Ending dates",
    });
  }

  try {
    const rentalBookings = await Booking.find({ rental: booking.rental });
    const isValid = checkIfBookingIsValid(booking, rentalBookings);
    const isMissing = checkIfBookingDatesAreMissing(booking);
    const isCronological = checkIfBookingDatesAreChronological(booking);
    if (isMissing && isValid && isCronological) {
      const savedBooking = await booking.save();
      return res.json({
        startAt: savedBooking.startAt,
        endAt: savedBooking.endAt,
      });
    } else {
      return res.sendApiError({
        title: "Invalid booking",
        detail: "Chosen dates are not available",
      });
    }
  } catch (error) {
    return res.mongoError(error);
  }
};

exports.deleteBooking = async (req, res) => {
  const { bookingId } = req.params;
  const { user } = res.locals;
  try {
    const booking = await Booking.findById(bookingId).populate("user");
    // dont delete other people bookings
    if (user.id !== booking.user.id) {
      return res.sendApiError({
        title: "Invalid user",
        detail: "You don't have the credentials to delete this booking",
      });
    }
    // dont delete current running bookings with less than 3 days
    if (moment(booking.startAt).diff(moment(), "days") > DAYS_THRESHOLD) {
      await booking.remove();
      return res.json({ id: bookingId });
    } else {
      return res.sendApiError({
        title: "Invalid booking",
        detail: `You cannot delete booking with less than ${DAYS_THRESHOLD} days before arrival`,
      });
    }
  } catch (error) {
    return res.mongoError(error);
  }
};

function checkIfBookingDatesAreChronological(booking) {
  let isValid = true;
  if (moment(booking.startAt) > moment(booking.endAt)) {
    isValid = false;
  }
  return isValid;
}
function checkIfBookingDatesAreMissing(booking) {
  let isValid = true;
  if (!booking.startAt || !booking.endAt) {
    isValid = false;
  }
  return isValid;
}

function checkIfBookingIsValid(pendingBooking, rentalBookings) {
  let isValid = true;
  // 'rentalBookings' - times the 'rental' place is already booked
  // for a certain period
  // checks ALL BOOKINGS
  if (rentalBookings && rentalBookings.length > 0) {
    isValid = rentalBookings.every((booking) => {
      const pendingStart = moment(pendingBooking.startAt);
      const pendingEnd = moment(pendingBooking.endAt);

      const bookingStart = moment(booking.startAt);
      const bookingEnd = moment(booking.endAt);

      return (
        (bookingStart < pendingStart && bookingEnd < pendingStart) ||
        (pendingEnd < bookingEnd && pendingEnd < bookingStart)
      );
    });
  }
  return isValid;
}
