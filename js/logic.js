import { formatHm, formatSeconds } from './clock.js';

export function getCelestialState(now, location) {
  const sun = computeSunTimes(now, location.lat, location.lon);
  const moon = computeMoonState(now);
  return {
    sunrise: sun.sunrise,
    sunset: sun.sunset,
    solarNoon: sun.solarNoon,
    dayLengthMs: sun.sunset.getTime() - sun.sunrise.getTime(),
    moonPhase: moon.phaseName,
    moonIllumination: moon.illumination,
  };
}

export function evaluateTradition(pack, now, celestial, calendarRows) {
  const context = pack.compute(now, celestial, calendarRows);
  const nextDelta = context.nextEvent ? (context.nextEvent.at.getTime() - now.getTime()) / 1000 : 0;
  context.nextCountdown = formatSeconds(nextDelta);
  context.sunriseLabel = formatHm(celestial.sunrise);
  context.sunsetLabel = formatHm(celestial.sunset);
  return context;
}

function computeSunTimes(date, lat, lon) {
  const zenith = 90.833;
  const day = dayOfYear(date);
  const riseUtc = solarEventUtc(day, lat, lon, zenith, true);
  const setUtc = solarEventUtc(day, lat, lon, zenith, false);
  const offsetMinutes = -date.getTimezoneOffset();
  const riseLocal = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0) + (riseUtc * 3600000) + (offsetMinutes * 60000));
  const setLocal = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0) + (setUtc * 3600000) + (offsetMinutes * 60000));
  const solarNoon = new Date((riseLocal.getTime() + setLocal.getTime()) / 2);
  return { sunrise: riseLocal, sunset: setLocal, solarNoon };
}

function solarEventUtc(day, lat, lon, zenith, isSunrise) {
  const lngHour = lon / 15;
  const tBase = isSunrise ? 6 : 18;
  const t = day + ((tBase - lngHour) / 24);
  const meanAnomaly = (0.9856 * t) - 3.289;
  let trueLong = meanAnomaly + (1.916 * Math.sin(toRad(meanAnomaly))) + (0.020 * Math.sin(toRad(2 * meanAnomaly))) + 282.634;
  trueLong = normalize(trueLong, 360);
  let rightAscension = toDeg(Math.atan(0.91764 * Math.tan(toRad(trueLong))));
  rightAscension = normalize(rightAscension, 360);
  const lQuadrant = Math.floor(trueLong / 90) * 90;
  const raQuadrant = Math.floor(rightAscension / 90) * 90;
  rightAscension += (lQuadrant - raQuadrant);
  rightAscension /= 15;
  const sinDec = 0.39782 * Math.sin(toRad(trueLong));
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(toRad(zenith)) - (sinDec * Math.sin(toRad(lat)))) / (cosDec * Math.cos(toRad(lat)));
  if (cosH > 1 || cosH < -1) {
    return isSunrise ? 6 : 18;
  }
  let hourAngle = isSunrise ? 360 - toDeg(Math.acos(cosH)) : toDeg(Math.acos(cosH));
  hourAngle /= 15;
  const localMeanTime = hourAngle + rightAscension - (0.06571 * t) - 6.622;
  return normalize(localMeanTime - lngHour, 24);
}

function computeMoonState(date) {
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  const synodicDays = 29.53058867;
  const daysSince = (date.getTime() - knownNewMoon) / 86400000;
  const phase = ((daysSince % synodicDays) + synodicDays) % synodicDays;
  const ratio = phase / synodicDays;
  const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * ratio));
  let phaseName = 'Waxing';
  if (ratio < 0.03 || ratio > 0.97) phaseName = 'New Moon';
  else if (ratio < 0.22) phaseName = 'Waxing Crescent';
  else if (ratio < 0.28) phaseName = 'First Quarter';
  else if (ratio < 0.47) phaseName = 'Waxing Gibbous';
  else if (ratio < 0.53) phaseName = 'Full Moon';
  else if (ratio < 0.72) phaseName = 'Waning Gibbous';
  else if (ratio < 0.78) phaseName = 'Last Quarter';
  else phaseName = 'Waning Crescent';
  return { phaseName, illumination: illumination.toFixed(2) };
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function toDeg(value) {
  return (value * 180) / Math.PI;
}

function normalize(value, max) {
  let out = value;
  while (out < 0) out += max;
  while (out >= max) out -= max;
  return out;
}
