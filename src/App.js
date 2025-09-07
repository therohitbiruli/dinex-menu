import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ScanToSeeMenuApp from "./ScanToSeeMenuApp";
import CustomerMenu from "./CustomerMenu";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* The main app with landing page and panel */}
        <Route path="/" element={<ScanToSeeMenuApp />} />
        {/* The dedicated, QR-code-linked customer menu */}
        <Route path="/menu" element={<CustomerMenu />} />
      </Routes>
    </Router>
  );
};
export default App;