import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Messages from '../components/Messages';
import Header from '../components/Header';
import Login from '../components/Login';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Messages />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
