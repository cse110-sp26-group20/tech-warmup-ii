/* eslint-env node */
import { spin, PAYLINES } from '../src/logic/SlotMachineMath.js';

const TOTAL_SPINS = 500000;
const WAGER_PER_LINE = 1;
const ACTIVE_LINES = PAYLINES.length; // 5
const WAGER_PER_SPIN = WAGER_PER_LINE * ACTIVE_LINES; // 5 total
const LOG_INTERVAL = 50000;

function runSimulation() {
  console.log(`Starting RTP simulation for ${TOTAL_SPINS.toLocaleString()} spins...`);
  console.log(`Wager per line: ${WAGER_PER_LINE} | Active lines: ${ACTIVE_LINES} | Total wager per spin: ${WAGER_PER_SPIN}`);
  
  let totalWagered = 0;
  let totalReturned = 0;

  for (let i = 1; i <= TOTAL_SPINS; i++) {
    totalWagered += WAGER_PER_SPIN;
    
    // Perform spin using existing math logic
    const result = spin(WAGER_PER_LINE);
    
    // Accumulate payout with undefined/invalid protection
    if (result && typeof result.totalPayout === 'number') {
      totalReturned += result.totalPayout;
    } else {
      console.warn(`Invalid spin result at iteration ${i}:`, result);
    }

    // Log progress without slowing down execution
    if (i % LOG_INTERVAL === 0) {
      const currentRTP = (totalReturned / totalWagered) * 100;
      console.log(`Progress: ${i.toLocaleString()} spins | Current RTP: ${currentRTP.toFixed(2)}%`);
    }
  }

  const finalRTP = (totalReturned / totalWagered) * 100;

  console.log('\n--- Simulation Complete ---');
  console.log(`Total Spins:    ${TOTAL_SPINS.toLocaleString()}`);
  console.log(`Total Wagered:  ${totalWagered.toLocaleString()}`);
  console.log(`Total Returned: ${totalReturned.toLocaleString()}`);
  console.log(`Final RTP:      ${finalRTP.toFixed(4)}%`);
  
  const targetRTP = 96.0;
  const tolerance = 2.0; // Acceptable variance range for 500k spins (rough estimate)
  
  if (Math.abs(finalRTP - targetRTP) <= tolerance) {
    console.log(`\nResult: RTP is within the acceptable ${tolerance}% variance range of the ${targetRTP}% target.`);
  } else {
    console.log(`\nResult: RTP is OUTSIDE the acceptable ${tolerance}% variance range of the ${targetRTP}% target.`);
  }
}

// Edge case handling: zero wager protection
if (WAGER_PER_LINE <= 0) {
  console.error("Error: WAGER_PER_LINE must be greater than 0 to calculate RTP accurately.");
  process.exit(1);
}

runSimulation();
