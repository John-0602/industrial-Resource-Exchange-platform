/**
 * Industrial Material Matching & Compatibility Algorithm
 * Calculates compatibility score (0-100%) and factor explanations
 */
const calculateCompatibility = (requirement, resource) => {
  let score = 0;
  const factors = [];
  const explanations = [];

  const reqCat = requirement.materialCategory || requirement.category;
  const resCat = resource.category || resource.materialCategory;

  // 1. Category & Keyword Match (35 points max)
  if (reqCat && resCat && reqCat.trim().toLowerCase() === resCat.trim().toLowerCase()) {
    score += 25;
    factors.push({ name: 'Category Match', points: 25, max: 25 });
    explanations.push(`Exact category match: "${resCat}"`);

    // Check keyword intersections in title / specs / intendedUse
    const reqTitle = requirement.materialTitle || requirement.title || '';
    const reqSpecs = requirement.specificationDetails || requirement.specifications || '';
    const reqText = `${reqTitle} ${reqSpecs}`.toLowerCase();

    const resTitle = resource.title || '';
    const resDesc = resource.description || '';
    const resComp = resource.composition || resource.chemicalComposition || '';
    const resUse = resource.intendedUse || '';
    const resText = `${resTitle} ${resDesc} ${resComp} ${resUse}`.toLowerCase();
    
    const keywords = reqText.split(/\s+/).filter(w => w.length > 3);
    const matchedWords = keywords.filter(w => resText.includes(w));
    if (matchedWords.length > 0) {
      const kwPoints = Math.min(10, matchedWords.length * 2.5);
      score += kwPoints;
      factors.push({ name: 'Specification Keywords', points: kwPoints, max: 10 });
      explanations.push(`Technical keywords aligned: ${matchedWords.slice(0, 3).join(', ')}`);
    }
  } else {
    factors.push({ name: 'Category Match', points: 0, max: 25 });
    explanations.push(`Different category ("${resCat}")`);
  }

  // 2. Quantity Compatibility (25 points max)
  const reqQty = Number(requirement.requiredQuantity) || 1;
  const availQty = Number(resource.availableQuantity) || 0;
  
  if (requirement.unit === resource.unit) {
    if (availQty >= reqQty) {
      score += 25;
      factors.push({ name: 'Quantity Coverage', points: 25, max: 25 });
      explanations.push(`100% quantity available (${availQty} ${resource.unit} in stock vs ${reqQty} required)`);
    } else if (availQty >= reqQty * 0.3) {
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

  // 3. Condition & Quality Grade (15 points max)
  const reqCondition = (requirement.acceptableCondition || '').toLowerCase();
  const resCondition = (resource.materialCondition || resource.condition || '').toLowerCase();

  if (resCondition.includes('clean') || resCondition.includes('virgin') || resCondition.includes('production scrap') || resCondition.includes('reconditioned')) {
    score += 15;
    factors.push({ name: 'Quality Grade', points: 15, max: 15 });
    explanations.push(`Segregated industrial grade: "${resource.materialCondition || resource.condition}"`);
  } else if (reqCondition && resCondition.includes(reqCondition.split(' ')[0])) {
    score += 12;
    factors.push({ name: 'Condition Match', points: 12, max: 15 });
    explanations.push(`Condition matches receiver criteria: "${resource.materialCondition || resource.condition}"`);
  } else {
    score += 8;
    factors.push({ name: 'Standard Grade', points: 8, max: 15 });
    explanations.push(`Standard industrial grade: "${resource.materialCondition || resource.condition}"`);
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
    explanations.push(`Inter-state transit required: ${resource.pickupLocation?.city || 'Origin'}, ${resource.pickupLocation?.state || ''}`);
  }

  // 5. Budget / Indicative Price Alignment (10 points max)
  const maxBudget = Number(requirement.maxBudgetPerUnit !== undefined ? requirement.maxBudgetPerUnit : requirement.maxBudget || 0);
  const price = Number(resource.pricePerUnit !== undefined ? resource.pricePerUnit : resource.indicativePrice || 0);

  if (price === 0) {
    score += 10;
    factors.push({ name: 'Budget Alignment', points: 10, max: 10 });
    explanations.push('Material offered free or terms negotiable upon mutual agreement');
  } else if (maxBudget > 0) {
    if (price <= maxBudget) {
      score += 10;
      factors.push({ name: 'Budget Alignment', points: 10, max: 10 });
      explanations.push(`Price (${price} ${resource.currency || 'INR'}) is within maximum budget (${maxBudget})`);
    } else if (price <= maxBudget * 1.25) {
      score += 6;
      factors.push({ name: 'Budget Alignment', points: 6, max: 10 });
      explanations.push(`Price is within 25% of target budget (subject to volume negotiation)`);
    } else {
      factors.push({ name: 'Budget Alignment', points: 2, max: 10 });
      explanations.push(`Listed price exceeds targeted budget threshold`);
    }
  } else {
    score += 8;
    factors.push({ name: 'Indicative Price Available', points: 8, max: 10 });
    explanations.push(`Indicative price: ₹${price} / ${resource.unit}`);
  }

  // Bound score between 0 and 100
  const compatibilityScore = Math.min(100, Math.max(0, Math.round(score)));

  return {
    compatibilityScore,
    compatibilityTier: compatibilityScore >= 75 ? 'Excellent Match' : compatibilityScore >= 50 ? 'Strong Match' : 'Potential Match',
    factors,
    explanations,
    disclaimer: 'Compatibility score is an algorithmic recommendation based on stated specifications and does not replace technical material sampling and compliance review.'
  };
};

module.exports = { calculateCompatibility };
