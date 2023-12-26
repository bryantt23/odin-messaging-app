import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Messages from '../components/Messages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Messages />} />
      </Routes>
    </Router>
  );
}

export default App;
