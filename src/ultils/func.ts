export function removeHttps(url: string) {
  const parts = url.split("/");
  return parts[parts.length - 1];
}

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function extractId(input: string): string  {
  const match = input.match(/j:\\?"([^"]+)\\?"/);
  return match ? match[1] : "";
}
