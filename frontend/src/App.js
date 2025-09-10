import logo from './logo.svg';
import './App.css';
import ProductPage from './pages/ProductPage';
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <ProductPage/>
      </Router>
    </div>
  );
}

export default App;
