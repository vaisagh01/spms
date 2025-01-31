import "./globals.css";
import { UserProvider } from "./context/UserContext";
import { Poppins, Raleway } from "next/font/google";

const poppins = Poppins({weight: '400', subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <UserProvider>
        <body className={poppins.className}>
          {children}
        </body>
      </UserProvider>
    </html>
  );
}
