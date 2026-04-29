export default function Card({ children }) {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-4 hover:scale-105">
      {children}
    </div>
  );
}