import axios from "axios";

export const verifyLocation = async (
  latitude: number,
  longitude: number
) => {
  const res = await axios.get(
    `http://localhost:8000/verify-location?lat=${latitude}&lon=${longitude}`
  );
  return res.data;
};

