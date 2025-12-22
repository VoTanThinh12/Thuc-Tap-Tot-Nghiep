import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({
  rating,
  size = 20,
  color = "#ffc107",
  showNumber = true,
  interactive = false,
  onRatingChange,
}) => {
  const ratingValue = Number(rating) || 0;
  const stars = [];

  const handlePick = (value) => {
    if (!interactive) return;
    if (typeof onRatingChange === "function") onRatingChange(value);
  };

  const [hoverRating, setHoverRating] = React.useState(0);
  const displayRating = interactive ? hoverRating || ratingValue : ratingValue;

  if (interactive) {
    for (let i = 1; i <= 5; i++) {
      const filled = i <= displayRating;
      stars.push(
        <span
          key={i}
          role="button"
          tabIndex={0}
          onClick={() => handlePick(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handlePick(i);
          }}
          style={{
            cursor: "pointer",
            display: "inline-flex",
            marginRight: "2px",
          }}
        >
          {filled ? (
            <FaStar size={size} color={color} />
          ) : (
            <FaRegStar size={size} color={color} />
          )}
        </span>
      );
    }
  } else {
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

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

    const emptyStars = 5 - Math.ceil(ratingValue);
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
  }

  return (
    <div className="d-flex align-items-center">
      <div className="d-flex">{stars}</div>
      {showNumber && (
        <span className="ms-2 text-muted" style={{ fontSize: size * 0.8 }}>
          ({(Number(displayRating) || 0).toFixed(1)})
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
