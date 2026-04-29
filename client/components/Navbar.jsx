import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-orange-500 text-white p-4 flex justify-between items-center shadow-lg">
      <h1 className="text-xl font-bold">Smart Attendance</h1>
      <button
        onClick={logout}
        className="bg-white text-orange-500 px-4 py-1 rounded hover:scale-105"
      >
        Logout
      </button>
    </div>
  );
}