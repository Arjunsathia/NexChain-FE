import React from "react";
import { Outlet } from "react-router-dom";

function CoinPageOutlet() {
  return (
    <div className="min-h-screen bg-transparent">
      <Outlet />
    </div>
  );
}

export default CoinPageOutlet;