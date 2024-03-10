export const formatTime = (secs: number, leadingZeroMinutes = false) =>
  (
    secs > 3600 ?  String(Math.floor(secs / 3600)) + ':' : ''
  ) +
  String(Math.floor((secs % 3600) / 60)).padStart((leadingZeroMinutes || secs > 3600) ? 2 : 1, '0') +
  ':' +
  String(Math.floor(secs % 60)).padStart(2, '0')
