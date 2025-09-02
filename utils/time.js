export const formatFocusTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const minutesString = String(minutes).padStart(2, "0");
  const secondsString = String(remainingSeconds).padStart(2, "0");
  return `${minutesString}:${secondsString}`;
};
