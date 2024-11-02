import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BottomNavBar from "@/components/BottomNavBar";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jeff & Teresa Wedding",
  description: "Jeff & Teresa Wedding",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className={inter.className} style={{ paddingBottom: "80px" }}>
        <ToastContainer />
        <ThemeProvider theme={theme}>
          {children} <BottomNavBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
