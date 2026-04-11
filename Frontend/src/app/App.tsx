import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AppProvider } from './context/AppContext';
import { router } from './routes';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0F1F3D',
            border: '1px solid #1E3A6E',
            color: '#F1F5F9',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '13px',
          },
        }}
      />
    </AppProvider>
  );
}
