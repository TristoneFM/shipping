import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { DeliveryProvider } from './context/DeliveryContext';

export default function RootLayout({ children }) {
  return (
    <html>
        <head>
            <title>Tristone Flowtech</title>
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
        </head>
        <body>
          
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <DeliveryProvider>
            {children}
            </DeliveryProvider>
        </body>
    </html>  
  );
}
