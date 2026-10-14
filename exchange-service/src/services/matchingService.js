/**
 * Industrial Material Matching & Compatibility Algorithm
 * Calculates compatibility score (0-100%) and factor explanations
 */
const calculateCompatibility = (requirement, resource) => {
  let score = 0;
  const factors = [];
  const explanations = [];

  // 1. Category & Keyword Match (30 points max)
  if (requirement.materialCategory === resource.materialCategory) {
    score += 20;
    factors.push({ name: 'Category Match', points: 20, max: 20 });
    explanations.push(`Exact category match: "${requirement.materialCategory}"`);

    // Check keyword intersections in title / specs / intendedUse
    const reqText = `${requirement.title} ${requirement.specifications}`.toLowerCase();
    const resText = `${resource.title} ${resource.description} ${resource.chemicalComposition || ''} ${resource.intendedUse || ''}`.toLowerCase();
    
    const keywords = reqText.split(/\s+/).filter(w => w.length > 3);
    const matchedWords = keywords.filter(w => resText.includes(w));
    if (matchedWords.length > 0) {
      const kwPoints = Math.min(10, matchedWords.length * 2.5);
      score += kwPoints;
      factors.push({ name: 'Specification Keywords', points: kwPoints, max: 10 });
      explanations.push(`Technical keywords aligned: ${matchedWords.slice(0, 3).join(', ')}`);
    }
  } else {
    // Cross-category synergy check
    factors.push({ name: 'Category Match', points: 0, max: 20 });
    explanations.push(`Different category ("${resource.materialCategory}")`);
  }

  // 2. Quantity Compatibility (25 points max)
  const reqQty = Number(requirement.requiredQuantity);
  const availQty = Number(resource.availableQuantity);
  
  if (requirement.unit === resource.unit) {
    if (availQty >= reqQty) {
      score += 25;
      factors.push({ name: 'Quantity Coverage', points: 25, max: 25 });
      explanations.push(`100% quantity available (${availQty} ${resource.unit} in stock vs ${reqQty} required)`);
    } else if (availQty >= reqQty * 0.5) {
      const partialPoints = Math.round((availQty / reqQty) * 20);
      score += partialPoints;
      factors.push({ name: 'Partial Quantity', points: partialPoints, max: 25 });
      explanations.push(`Partial quantity available: fulfills ${Math.round((availQty / reqQty) * 100)}% of requirement`);
    } else {
      factors.push({ name: 'Quantity Coverage', points: 5, max: 25 });
      explanations.push(`Limited quantity: only ${availQty} ${resource.unit} available`);
    }
  } else {
    // Unit conversion heuristics (e.g. tonnes to kg)
    let convertedAvail = availQty;
    if (resource.unit === 'tonnes' && requirement.unit === 'kg') convertedAvail = availQty * 1000;
    if (resource.unit === 'kg' && requirement.unit === 'tonnes') convertedAvail = availQty / 1000;

    if (convertedAvail >= reqQty) {
      score += 22;
      factors.push({ name: 'Quantity (Unit Converted)', points: 22, max: 25 });
      explanations.push(`Compatible quantity under unit conversion (${resource.availableQuantity} ${resource.unit})`);
    } else {
      factors.push({ name: 'Quantity Coverage', points: 8, max: 25 });
      explanations.push(`Unit difference (${resource.unit} vs ${requirement.unit})`);
    }
  }

  // 3. Condition & Quality Grade (20 points max)
  const reqCondition = (requirement.acceptableCondition || '').toLowerCase();
  const resCondition = (resource.condition || '').toLowerCase();

  if (resCondition.includes('clean') || resCondition.includes('grade a') || resCondition.includes('virgin') || resCondition.includes('segregated')) {
    score += 20;
    factors.push({ name: 'Quality Grade', points: 20, max: 20 });
    explanations.push(`Premium/Segregated material grade: "${resource.condition}"`);
  } else if (reqCondition && resCondition.includes(reqCondition.split(' ')[0])) {
    score += 15;
    factors.push({ name: 'Condition Match', points: 15, max: 20 });
    explanations.push(`Condition matches receiver criteria: "${resource.condition}"`);
  } else {
    score += 10;
    factors.push({ name: 'Standard Grade', points: 10, max: 20 });
    explanations.push(`Standard industrial grade: "${resource.condition}"`);
  }

  // 4. Geographic Proximity (15 points max)
  const reqCity = (requirement.deliveryLocation?.city || '').toLowerCase();
  const reqState = (requirement.deliveryLocation?.state || '').toLowerCase();
  const resCity = (resource.pickupLocation?.city || '').toLowerCase();
  const resState = (resource.pickupLocation?.state || '').toLowerCase();

  if (reqCity && resCity && reqCity === resCity) {
    score += 15;
    factors.push({ name: 'Local City Logistics', points: 15, max: 15 });
    explanations.push(`Immediate local hub: Both facilities located in ${resource.pickupLocation.city}`);
  } else if (reqState && resState && reqState === resState) {
    score += 10;
    factors.push({ name: 'Intra-State Logistics', points: 10, max: 15 });
    explanations.push(`Intra-state proximity: Located within ${resource.pickupLocation.state}`);
  } else {
    score += 5;
    factors.push({ name: 'Inter-State Logistics', points: 5, max: 15 });
    explanations.push(`Inter-state transit required: ${resource.pickupLocation.city}, ${resource.pickupLocation.state}`);
  }

  // 5. Budget / Indicative Price Alignment (10 points max)
  const maxBudget = Number(requirement.maxBudget);
  const price = Number(resource.indicativePrice);

  if (price === 0) {
    score += 10;
    factors.push({ name: 'Budget Alignment', points: 10, max: 10 });
    explanations.push('Material offered free or terms negotiable upon mutual agreement');
  } else if (maxBudget > 0) {
    if (price <= maxBudget) {
      score += 10;
      factors.push({ name: 'Budget Alignment', points: 10, max: 10 });
      explanations.push(`Price (${price} ${resource.currency}) is within maximum budget (${maxBudget} ${requirement.currency})`);
    } else if (price <= maxBudget * 1.25) {
      score += 5;
      factors.push({ name: 'Budget Alignment', points: 5, max: 10 });
      explanations.push(`Price is within 25% of target budget (subject to volume negotiation)`);
    } else {
      factors.push({ name: 'Budget Alignment', points: 0, max: 10 });
      explanations.push(`Listed price exceeds targeted budget threshold`);
    }
  } else {
    score += 8;
    factors.push({ name: 'Indicative Price Available', points: 8, max: 10 });
    explanations.push(`Indicative price: ${price} ${resource.currency}/${resource.unit}`);
  }

  // Bound score between 0 and 100
  const compatibilityScore = Math.min(100, Math.max(0, Math.round(score)));

  return {
    compatibilityScore,
    compatibilityTier: compatibilityScore >= 80 ? 'Excellent Match' : compatibilityScore >= 60 ? 'Strong Match' : 'Potential Match',
    factors,
    explanations,
    disclaimer: 'Compatibility score is an algorithmic recommendation based on stated specifications and does not replace technical material sampling and compliance review.'
  };
};

module.exports = { calculateCompatibility };
