import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Messages from '../components/Messages';
import Header from '../components/Header';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Messages />} />
      </Routes>
    </Router>
  );
}

export default App;
