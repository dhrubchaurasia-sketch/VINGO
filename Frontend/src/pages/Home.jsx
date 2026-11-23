import React from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import DeliveryBoy from "../components/DeliveryBoy";
import Nav from "../components/Nav";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();

  const rawDiet = (searchParams.get("diet") || "all").toLowerCase();
  const dietFilter =
    rawDiet === "veg" || rawDiet === "nonveg" ? rawDiet : "all";
  const searchQuery = searchParams.get("search") || "";

  return (
    <div className="w-full min-h-screen pt-18.5 flex flex-col items-center bg-[#fff9f6]">
      <Nav />
      {userData?.role === "user" && (
        <UserDashboard dietFilter={dietFilter} searchQuery={searchQuery} />
      )}
      {userData?.role === "owner" && <OwnerDashboard />}
      {userData?.role === "deliveryBoy" && <DeliveryBoy />}
    </div>
  );
}

export default Home;