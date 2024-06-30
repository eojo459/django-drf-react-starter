import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
//import { StyledEngineProvider, ThemeProvider, createTheme } from '@mui/material/styles';
import { darkPalette, lightPalette } from './styles/Theme';
import { CssBaseline } from '@mui/material';
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

export const ColorModeContext = React.createContext({ toggleColorMode: () => { } });

root.render(
  <React.StrictMode>
    <ColorSchemeScript />
    <MantineProvider>
      <Notifications position="top-center"/>
      <ModalsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  </React.StrictMode>
);

// root.render(
//   <Index/>
// )

// root.render(
//   <React.StrictMode>
//     <html lang="en">
//       <head>
//         <meta charSet="UTF-8" />
//         <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <title></title>
//       </head>
//       <body>
//         <ColorSchemeScript />
//         <MantineProvider>
//           <ModalsProvider>
//             <BrowserRouter>
//               <App />
//             </BrowserRouter>
//           </ModalsProvider>
//         </MantineProvider>
//       </body>
//     </html>
//   </React.StrictMode>
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
function generateColors(arg0: string): import("@mantine/core").MantineColorsTuple | undefined {
  throw new Error('Function not implemented.');
}

