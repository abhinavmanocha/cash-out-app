import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CashOutForm from './components/CashOutForm';
import ManagerDashboard from './components/ManagerDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 font-sans">
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="font-bold text-xl text-red-600">St. Louis</span>
                  <span className="ml-2 font-semibold text-gray-800">Cash Out</span>
                </div>
                <div className="sm:-my-px sm:ml-6 flex space-x-4 sm:space-x-8">
                  <Link
                    to="/"
                    className="border-transparent text-gray-500 hover:border-red-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Staff Form
                  </Link>
                  <Link
                    to="/manager"
                    className="border-transparent text-gray-500 hover:border-red-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Manager Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<CashOutForm />} />
              <Route path="/manager" element={<ManagerDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
