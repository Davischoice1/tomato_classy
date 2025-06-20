import React from "react";
import { ImageUpload } from "./home";  // Importing the ImageUpload component
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Create your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#3e5c56",  // Your custom color
    },
    common: {
      white: "#69968d",  // Ensure white is available
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ImageUpload />  {/* Render the ImageUpload component */}
    </ThemeProvider>
  );
}

export default App;
