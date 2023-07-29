import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { themeSettings } from "../../ticket-booking-admin/src/theme";
import Topbar from "./global/Topbar";
import BookingOrder from "./scenes/BookingOrder";
import BookingSearch from "./scenes/BookingSearch";
import LandingPage from "./scenes/LandingPage";

const App = () => {
  const theme = createTheme(themeSettings());
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="bottom-right" />
      <QueryClientProvider client={queryClient}>
        <div className="app">
          <Topbar />
          <main className="content">
            <Container maxWidth="lg">
              <Routes>
                <Route path="/">
                  <Route index element={<LandingPage />} />
                  <Route path="booking" element={<BookingOrder />} />
                  <Route path="booking-search" element={<BookingSearch />} />
                </Route>
              </Routes>
            </Container>
          </main>
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
