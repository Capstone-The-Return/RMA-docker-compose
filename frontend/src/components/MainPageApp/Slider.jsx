import img1 from "../../assets/img1.jpg";
import img2 from "../../assets/img2.jpg";
import img3 from "../../assets/img3.jpg";

function Slider() {
  return (
    <div
      id="carouselExampleCaptions"
      className="carousel slide"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="carousel-indicators">
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="0"
          className="active"
          aria-current="true"
          aria-label="Slide 1"
        ></button>
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="1"
          aria-label="Slide 2"
        ></button>
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="2"
          aria-label="Slide 3"
        ></button>
      </div>
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img src={img1} className="d-block w-100" alt="First slide" />
          <div className="carousel-caption d-none d-md-block">
            <h1>For fast service,go Electronics!</h1>
            <p>
              Unrealistic repair speed from 20' with the leading Repair Experts
            </p>
          </div>
        </div>
        <div className="carousel-item">
          <img src={img2} className="d-block w-100" alt="Second slide" />
          <div className="carousel-caption d-none d-md-block">
            <h1>Our priority is your Satisfaction</h1>
            <p>Reliable solutions for all your electronic needs..</p>
          </div>
        </div>
        <div className="carousel-item">
          <img src={img3} className="d-block w-100" alt="Third slide" />
          <div className="carousel-caption d-none d-md-block">
            <h1>From the most passionate team.</h1>
            <p>Working together with love and dedication for what we do.</p>
          </div>
        </div>
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}

export default Slider;
