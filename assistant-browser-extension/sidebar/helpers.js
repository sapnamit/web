export async function findCouponsForDomain(domain) {
  // Placeholder: return common coupon keywords; integrate with coupon APIs later
  const generic = [
    { code: 'WELCOME10', description: '10% off first order' },
    { code: 'FREESHIP', description: 'Free shipping over $50' }
  ];
  if (!domain) return generic;
  return generic;
}

export async function planTravel(query) {
  // Placeholder: a naive mock planner
  return {
    steps: [
      'Confirm origin and destination',
      'Pick travel dates and flexibility',
      'Search flights and compare 2-3 options',
      'Book refundable option if uncertain'
    ]
  };
}
