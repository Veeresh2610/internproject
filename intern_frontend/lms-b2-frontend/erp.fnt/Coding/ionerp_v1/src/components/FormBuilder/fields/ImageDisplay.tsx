import React from "react";

interface ImageDisplayProps {
  name: string;
  label: string;
  value?: any; // URL of the image
  error?: any;
  width?: number;
  height?: number;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  name,
  label,
  value,
  error,
  width = 150,
  height = 150,
}) => {
  return (
    <div className="image-display">
      <label>{label}</label>
      {value ? (
        <img
          src={value}
          alt={name}
          width={width}
          height={height}
          style={{
            objectFit: "cover",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      ) : (
        <p>No image available</p>
      )}
      {error && <p className="error-text">{error.message}</p>}
    </div>
  );
};

export default ImageDisplay;
