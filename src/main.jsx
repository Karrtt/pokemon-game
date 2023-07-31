import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import Items from "./items"
import "./index.css"
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <Router>
      <div>
        {/* Navigation Links */}

        {/* Route Configuration */}
        <Routes>
          <Route exact path="/" element={<App/>} />
          <Route path="/items" element={<Items/>} />
        </Routes>
      </div>
    </Router>
  </React.StrictMode>
)
