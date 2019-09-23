exports.timeStringToMinutes = str => {
  str = str.split(":");
  return parseInt(str[0]) * 60 + parseInt(str[1]);
};

exports.minutesToTotalTimeString = (minutes, minMinutes = 0, maxMinutes = 1440) => {
  minutes = parseInt(minutes);
  // console.log("minutes", maxMinutes, minutes);
  if (maxMinutes > 0 && (minutes <= minMinutes || minutes > maxMinutes)) {
    return "-";
  }
  const hour = parseInt(minutes / 60);
  const minute = ("00" + parseInt(minutes % 60)).slice(-2);
  // console.log(hour, minute);
  return `${hour}:${minute}`;
};

exports.minutesToTimeString = (minutes, minMinutes = 0, maxMinutes = 1440) => {
  minutes = parseInt(minutes);
  // console.log("minutes", maxMinutes, minutes);
  if (maxMinutes > 0 && (minutes <= minMinutes || minutes > maxMinutes)) {
    return "-";
  }
  
  const hour = ("00" + parseInt(minutes / 60)).slice(-2);
  const minute = ("00" + parseInt(minutes % 60)).slice(-2);
  // console.log(hour, minute);
  return `${hour}:${minute}`;
};

exports.areMinuteRangesOverlapping = (
  initialRangeStartMinute,
  initialRangeEndMinute,
  comparedRangeStartMinute,
  comparedRangeEndMinute
) => {
  if (initialRangeEndMinute < initialRangeStartMinute) {
    const end = initialRangeStartMinute;
    initialRangeStartMinute = initialRangeEndMinute;
    initialRangeEndMinute = end;
  }
  if (comparedRangeEndMinute < comparedRangeStartMinute) {
    const end = comparedRangeStartMinute;
    comparedRangeStartMinute = comparedRangeEndMinute;
    comparedRangeEndMinute = end;
  }

  return initialRangeEndMinute > comparedRangeStartMinute;
};
