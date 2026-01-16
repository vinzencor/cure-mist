import "./Preloader.css";

export default function Preloader() {
  return (
    <div className="preloader-container">
      <img
        src="/Preloader/preloader.png"
        alt="Loading"
        className="loader-image"
      />
    </div>
  );
}
