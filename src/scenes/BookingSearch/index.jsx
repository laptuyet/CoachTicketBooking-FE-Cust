import ContentPasteSearchOutlinedIcon from "@mui/icons-material/ContentPasteSearchOutlined";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { compareAsc, format, isAfter, parse } from "date-fns";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import * as bookingApi from "../../queries/booking/ticketQueries";
import { tokens } from "../../theme";
import { APP_CONSTANTS } from "../../utils/appContants";
import { messages } from "../../utils/validationMessages";

const getFormattedBookingDate = (bookingDateTime) => {
  return format(
    parse(bookingDateTime, "yyyy-MM-dd HH:mm", new Date()),
    "dd/MM/yyyy"
  );
};

const getFormattedPaymentDateTime = (paymentDateTime) => {
  return format(
    parse(paymentDateTime, "yyyy-MM-dd HH:mm:ss", new Date()),
    "HH:mm:ss dd/MM/yyyy"
  );
};

const getBookingPrice = (trip) => {
  let finalPrice = trip.price;
  if (!isNaN(trip?.discount?.amount)) {
    finalPrice -= trip.discount.amount;
  }
  return finalPrice;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const BookingSearch = () => {
  const colors = tokens();
  const [openModal, setOpenModal] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [isInValidPhone, setIsInValidPhone] = useState(false);
  // const [searchClicked, setSearchClicked] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(-1);
  const queryClient = useQueryClient();

  const bookingSearchQuery = useQuery({
    queryKey: ["bookings", "all", searchPhone],
    queryFn: () => bookingApi.getAllByPhone(searchPhone),
    enabled: !isInValidPhone && searchPhone !== "",
  });

  const bookingDetailQuery = useQuery({
    queryKey: ["bookings", selectedTicket],
    queryFn: () => bookingApi.getBooking(selectedTicket),
    enabled: selectedTicket >= 0,
  });

  const checkValidPhone = (phone) => {
    if (phone !== "") {
      if (!APP_CONSTANTS.PHONE_REGEX.test(phone)) {
        queryClient.removeQueries({ queryKey: ["bookings", "all", phone] });
        setIsInValidPhone(true);
      } else setIsInValidPhone(false);
    } else setIsInValidPhone(false);
  };

  const checkValidPhoneDebounced = debounce(checkValidPhone, 700);

  const handleSearchPhoneChange = (e) => {
    let phone = e.target.value;
    setSearchPhone(phone);
    checkValidPhoneDebounced(phone);
  };

  const getDepartureDateTime = (ticket) => {
    let bookingDate = getFormattedBookingDate(ticket.bookingDateTime);
    return ticket.trip.departureTime.concat(" ", bookingDate);
  };

  const filterTickets = (ticketList) => {
    if (ticketList?.length === 0) return ticketList;

    let finalTickets = ticketList;
    // filter
    finalTickets = ticketList.filter((ticket) => {
      const departureDateTime = getDepartureDateTime(ticket);
      return isAfter(
        parse(departureDateTime, "HH:mm dd/MM/yyyy", new Date()),
        new Date()
      );
    });

    const compareByDepartureDateTimeAsc = (a, b) => {
      const aDateTime = parse(
        getDepartureDateTime(a),
        "HH:mm dd-MM-yyyy",
        new Date()
      );
      const bDateTime = parse(
        getDepartureDateTime(b),
        "HH:mm dd-MM-yyyy",
        new Date()
      );
      return compareAsc(bDateTime, aDateTime);
    };

    // sort desc
    finalTickets.sort(compareByDepartureDateTimeAsc);

    return finalTickets;
  };

  // filter and sort booking date desc
  useEffect(() => {
    const newTickets = filterTickets(bookingSearchQuery?.data ?? []);
    setFilteredTickets(newTickets);
  }, [bookingSearchQuery.data, searchPhone]);

  return (
    <Box mt="100px" display="flex" flexDirection="column" gap="20px">
      <Box
        bgcolor={colors.primary[100]}
        display="flex"
        justifyContent="center"
        borderRadius="6px"
        p="30px 200px"
        gap="30px"
      >
        <TextField
          fullWidth
          value={searchPhone}
          onChange={handleSearchPhoneChange}
          id="phone"
          label="Số điện thoại"
          variant="standard"
          error={isInValidPhone}
          helperText={isInValidPhone && messages.phone.invalid}
          InputProps={{
            style: {
              fontSize: "1.5rem",
            },
          }}
          InputLabelProps={{
            style: {
              fontSize: "1.2rem",
            },
          }}
        />
      </Box>
      {bookingSearchQuery?.data && !isInValidPhone ? (
        bookingSearchQuery.data.length !== 0 && !isInValidPhone ? (
          <Box
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gap="30px"
            p="50px"
            sx={{
              width: "100%",
              position: "relative",
              overflow: "auto",
              maxHeight: 400,
            }}
          >
            {filteredTickets.map((booking) => {
              const { trip, bookingDateTime, seatNumber } = booking;
              return (
                <Card
                  key={booking.id}
                  onClick={() => {
                    setSelectedTicket(booking.id);
                    setOpenModal(!openModal);
                  }}
                  elevation={0}
                  sx={{
                    display: "flex",
                    // justifyContent: "center",
                    alignItems: "center",
                    gridColumn: "span 6",
                    cursor: "pointer",
                    padding: "0 20px",
                  }}
                >
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <CardContent>
                      <Typography component="span" variant="h6">
                        <span style={{ fontWeight: "bold" }}>Tuyến: </span>
                        {`${trip.source.name}
                           ${`\u21D2`}
                         ${trip.destination.name}`}
                      </Typography>
                      <Typography variant="h6">
                        {" "}
                        <span style={{ fontWeight: "bold" }}>Xe: </span>
                        {trip.coach.coachType}
                      </Typography>
                      <Typography variant="h6">
                        <span style={{ fontWeight: "bold" }}>Ngày đi: </span>{" "}
                        {trip.departureTime}{" "}
                        {getFormattedBookingDate(bookingDateTime)}
                      </Typography>
                      <Typography variant="h6">
                        <span style={{ fontWeight: "bold" }}>Ghế: </span>
                        {seatNumber}
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Box
            p="100px"
            display="flex"
            flexDirection="column"
            gap="10px"
            justifyContent="center"
            alignItems="center"
          >
            <ContentPasteSearchOutlinedIcon
              sx={{
                width: "150px",
                height: "150px",
                color: colors.greyAccent[500],
              }}
            />
            <Typography
              color={colors.greyAccent[500]}
              variant="h2"
              fontWeight="bold"
            >
              Không có kết quả
            </Typography>
          </Box>
        )
      ) : undefined}

      <Modal
        sx={{
          "& .MuiBox-root": {
            bgcolor: colors.primary[100],
          },
        }}
        open={openModal}
        onClose={() => setOpenModal(!openModal)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "50px",
          }}
        >
          {bookingDetailQuery?.data && (
            <>
              <Box>
                <Typography mb="40px" variant="h3" fontWeight="bold">
                  THÔNG TIN VÉ ĐẶT
                </Typography>
                <Typography component="span" variant="h6">
                  <span style={{ fontWeight: "bold" }}>Tuyến: </span>
                  {`${bookingDetailQuery.data.trip.source.name}
                           ${`\u21D2`}
                         ${bookingDetailQuery.data.trip.destination.name}`}
                </Typography>
                <Typography variant="h6">
                  {" "}
                  <span style={{ fontWeight: "bold" }}>Xe: </span>
                  {`${bookingDetailQuery.data.trip.coach.name} ${bookingDetailQuery.data.trip.coach.coachType}`}
                </Typography>
                <Typography variant="h6">
                  <span style={{ fontWeight: "bold" }}>Ngày đi: </span>{" "}
                  {bookingDetailQuery.data.trip.departureTime}{" "}
                  {getFormattedBookingDate(
                    bookingDetailQuery.data.bookingDateTime
                  )}
                </Typography>
                <Typography variant="h6">
                  <span style={{ fontWeight: "bold" }}>Giá vé: </span>
                  {`${formatCurrency(
                    getBookingPrice(bookingDetailQuery.data.trip)
                  )}`}
                </Typography>
                <Typography variant="h6">
                  <span style={{ fontWeight: "bold" }}>Ghế: </span>
                  {bookingDetailQuery.data.seatNumber}
                </Typography>
              </Box>
              <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap="15px"
              >
                <Divider sx={{ gridColumn: "span 4" }}>
                  Thông tin hành khách
                </Divider>
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label="Họ"
                  value={bookingDetailQuery.data.custFirstName}
                  name="custFirstName"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label="Tên"
                  value={bookingDetailQuery.data.custLastName}
                  name="custLastName"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label="Số điện thoại"
                  value={bookingDetailQuery.data.phone}
                  name="phone"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label="Email"
                  value={bookingDetailQuery.data.email ?? "Không có"}
                  name="email"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label="Địa chỉ đón"
                  value={bookingDetailQuery.data.pickUpAddress}
                  name="pickUpAddress"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    gridColumn: "span 4",
                  }}
                />
                <Divider sx={{ gridColumn: "span 4", mt: "20px" }}>
                  Thông tin thanh toán
                </Divider>
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label="Phương thức thanh toán"
                  value={
                    bookingDetailQuery.data.paymentMethod === "CASH"
                      ? "Tiền mặt"
                      : "Thẻ visa"
                  }
                  name="paymentMethod"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label="Trạng thái thanh toán"
                  value={
                    bookingDetailQuery.data.paymentStatus === "UNPAID"
                      ? "Chưa thanh toán"
                      : bookingDetailQuery.data.paymentStatus === "PAID"
                      ? "Đã thanh toán"
                      : " Đã hủy vé"
                  }
                  name="paymentStatus"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label="Ngày thanh toán"
                  value={getFormattedPaymentDateTime(
                    bookingDetailQuery.data.paymentDateTime
                  )}
                  name="paymentDateTime"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
                <TextField
                  color="warning"
                  size="small"
                  fullWidth
                  variant="outlined"
                  type="text"
                  label="Tổng tiền thanh toán"
                  value={formatCurrency(bookingDetailQuery.data.totalPayment)}
                  name="totalPayment"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    gridColumn: "span 2",
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default BookingSearch;
