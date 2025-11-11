// Simulate the API route's date filtering logic

const season = "2025-26";

// This is the code from lines 28-35 of the API route
const [startYear, endYear] = season.split('-').map(y =>
  y.length === 2 ? `20${y}` : y
);

const startDate = new Date(`${startYear}-11-01`);
const endDate = new Date(`${endYear}-04-30`);

console.log('\n=== Date Filter Analysis ===\n');
console.log(`Season: "${season}"`);
console.log(`Start Year: "${startYear}"`);
console.log(`End Year: "${endYear}"`);
console.log(`Start Date: ${startDate.toISOString()}`);
console.log(`End Date: ${endDate.toISOString()}`);

// Test March 2025 game dates
const testDates = [
  '2025-03-05',
  '2025-03-12', 
  '2025-03-13',
  '2025-11-04',
  '2025-11-09'
];

console.log('\n=== Game Date Tests ===\n');
testDates.forEach(dateStr => {
  const gameDate = new Date(dateStr);
  const inRange = gameDate >= startDate && gameDate <= endDate;
  console.log(`${dateStr}: ${inRange ? 'PASS' : 'FAIL'} (${gameDate >= startDate ? 'after start' : 'before start'}, ${gameDate <= endDate ? 'before end' : 'after end'})`);
});
