import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({
  rating,
  size = 20,
  color = "#ffc107",
  showNumber = true,
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Render full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <FaStar
        key={`full-${i}`}
        size={size}
        color={color}
        style={{ marginRight: "2px" }}
      />
    );
  }

  // Render half star
  if (hasHalfStar) {
    stars.push(
      <FaStarHalfAlt
        key="half"
        size={size}
        color={color}
        style={{ marginRight: "2px" }}
      />
    );
  }

  // Render empty stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <FaRegStar
        key={`empty-${i}`}
        size={size}
        color={color}
        style={{ marginRight: "2px" }}
      />
    );
  }

  return (
    <div className="d-flex align-items-center">
      <div className="d-flex">{stars}</div>
      {showNumber && (
        <span className="ms-2 text-muted" style={{ fontSize: size * 0.8 }}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

// Component cho việc chọn rating (interactive)
export const InteractiveStarRating = ({ rating, setRating, size = 24 }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (value) => {
    setRating(value);
  };

  const handleMouseEnter = (value) => {
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          size={size}
          color={i <= displayRating ? "#ffc107" : "#e4e5e9"}
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          style={{
            cursor: "pointer",
            marginRight: "4px",
            transition: "color 0.2s",
          }}
        />
      );
    }
    return stars;
  };

  return (
    <div className="d-flex align-items-center" onMouseLeave={handleMouseLeave}>
      {renderStars()}
      {rating > 0 && <span className="ms-2 text-muted">{rating} sao</span>}
    </div>
  );
};

export default StarRating;
