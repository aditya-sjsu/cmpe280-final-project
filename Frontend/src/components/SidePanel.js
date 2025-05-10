import React from "react";

const SidePanel = () => {
  return (
    <div className="side-panel">
      <p>Loading</p>
      <div className="no-internet-icon">
        {/* This is a placeholder for the internet icon; replace with actual icon as needed */}
        <span role="img" aria-label="no internet">📶</span>
      </div>
    </div>
  );
};

export default SidePanel;
