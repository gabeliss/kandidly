import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { useEffect } from 'react';
import { getUser, upsertUserAndCompany } from './api/auth';

function App() {
  useEffect(() => {
    getUser().then(user => {
      if (user) upsertUserAndCompany();
    });
  }, []);
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App 