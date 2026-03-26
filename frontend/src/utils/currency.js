export const NPR_TO_USD = 133;

export const formatCurrency = (npr) => {
    const usd = (npr / NPR_TO_USD).toFixed(2);
    return `NRs. ${npr.toLocaleString()} ($${usd})`;
};

export const parseAndFormatPriceRange = (priceStr) => {
    if (!priceStr) return 'Price not specified';
    
    // Try to find numbers in the string (e.g., "$500 - $1000", "500", "$300")
    // If it already contains NRs and $, just return it
    if (priceStr.includes('NRs') && priceStr.includes('$')) return priceStr;
    
    // Extract numbers after removing commas
    const cleanedStr = priceStr.replace(/,/g, '');
    const numbers = cleanedStr.match(/\d+/g);
    if (!numbers) return priceStr; // Return as is if no numbers
    
    // If it looks like it's in dollars (original placeholder was "$1000")
    if (priceStr.includes('$')) {
        const converted = numbers.map(n => {
            const usd = parseFloat(n);
            const npr = Math.round(usd * NPR_TO_USD);
            return `$${usd} (NRs. ${npr.toLocaleString()})`;
        });
        
        // Replace original numbers with converted ones
        let result = priceStr;
        numbers.forEach((n, i) => {
            result = result.replace(n, converted[i].replace(/^\$/,'')); // Keep symbols careful
        });
        // Actually simpler logic for ranges:
        if (numbers.length >= 2) {
            const usdMin = numbers[0];
            const usdMax = numbers[1];
            const nprMin = Math.round(parseFloat(usdMin) * NPR_TO_USD);
            const nprMax = Math.round(parseFloat(usdMax) * NPR_TO_USD);
            return `$${usdMin}-$${usdMax} (NRs. ${nprMin.toLocaleString()} - ${nprMax.toLocaleString()})`;
        } else {
            const usd = numbers[0];
            const npr = Math.round(parseFloat(usd) * NPR_TO_USD);
            return `$${usd} (NRs. ${npr.toLocaleString()})`;
        }
    }
    
    return priceStr;
};
