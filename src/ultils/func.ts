export function removeHttps(url: string) {
  const parts = url.split("/");
  return parts[parts.length - 1];
}

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
