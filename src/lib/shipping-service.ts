

'use server';

import { getVendorById, type PlainVendor } from './vendors-service';

// A plain object that can be safely passed to a Server Action
export interface ShippingCartItem {
    vendorId: string;
    quantity: number;
    packaging: {
        weight: number; // in kg
        dimensions: { l: number, w: number, h: number }; // in cm
    }
}

// --- Shiprocket API Types ---
interface ShiprocketRate {
    courier_name: string;
    rate: number; // This is the final rate including COD charges etc.
    etd: string;
    is_insurance_available: boolean;
}

// --- Types ---

export interface ShippingCost {
    customerCost: number;
    vendorCost: number;
    totalCost: number;
}

export interface ShippingEstimate {
    rate: number;
    etd: string; // Estimated Time of Delivery from API
}


// --- Service Functions ---

/**
 * Fetches available courier rates from the Shiprocket API.
 * @param fromPincode - The vendor's pickup pincode.
 * @param toPincode - The customer's delivery pincode.
 * @param weightKg - The package weight in kilograms.
 * @returns The best value shipping rate and its ETD.
 * @throws An error if the API call fails or no couriers are available.
 */
async function getShiprocketRate(fromPincode: string, toPincode: string, weightKg: number): Promise<ShippingEstimate> {
    const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external/courier/serviceability/";
    const SHIPROCKET_TOKEN = process.env.SHIPROCKET_API_TOKEN;

    if (!SHIPROCKET_TOKEN) {
        throw new Error("Shiprocket API token is not configured.");
    }

    const response = await fetch(SHIPROCKET_API_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SHIPROCKET_TOKEN}`
        },
        body: JSON.stringify({
            pickup_postcode: fromPincode,
            delivery_postcode: toPincode,
            weight: weightKg,
            cod: 0,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Shiprocket API Error:", errorBody);
        throw new Error(`Shiprocket API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 200 && data.data.available_courier_companies?.length > 0) {
        const availableCouriers: ShiprocketRate[] = data.data.available_courier_companies;

        // 1. Filter for insured couriers
        const insuredCouriers = availableCouriers.filter(c => c.is_insurance_available);
        if (insuredCouriers.length === 0) {
            console.warn("No insured couriers available for this route.");
            throw new Error("No insured shipping options found for this route.");
        }

        // 2. Find the fastest ETD among insured couriers
        const getMinDays = (etd: string) => parseInt(etd.split('-')[0], 10);
        const fastestEtdDays = Math.min(...insuredCouriers.map(c => getMinDays(c.etd)));

        // 3. Filter for all couriers that match the fastest ETD
        const fastestCouriers = insuredCouriers.filter(c => getMinDays(c.etd) === fastestEtdDays);

        // 4. Find the cheapest among the fastest
        const bestValueCourier = fastestCouriers.reduce((cheapest, current) => {
            return current.rate < cheapest.rate ? current : cheapest;
        });

        return {
            rate: bestValueCourier.rate,
            etd: bestValueCourier.etd,
        };
    } else {
        console.warn("No couriers available for this route:", fromPincode, "->", toPincode);
        throw new Error("No couriers found for the specified pincodes.");
    }
}


/**
 * Calculates the shipping cost for a list of cart items based on each vendor's settings.
 * @param items - A plain array of items with only shipping-relevant data.
 * @param customerPincode - The customer's delivery pincode.
 * @returns The total cost the customer has to pay for shipping.
 */
export async function calculateCustomerShippingCost(items: ShippingCartItem[], customerPincode: string): Promise<number> {
    if (!customerPincode || items.length === 0) {
        return 0;
    }

    let totalCustomerCost = 0;
    const vendorCache = new Map<string, PlainVendor | null>();

    for (const item of items) {
        let vendor = vendorCache.get(item.vendorId);
        if (!vendor) {
            vendor = await getVendorById(item.vendorId);
            vendorCache.set(item.vendorId, vendor);
        }

        try {
            if (!vendor || !vendor.pickupAddresses?.[0]?.pincode) {
                throw new Error(`Vendor ${item.vendorId} has no pickup address configured.`);
            }

            const fromPincode = vendor.pickupAddresses[0].pincode;
            const weightKg = (item.packaging?.weight || 0.5) * item.quantity;
            const { rate } = await getShiprocketRate(fromPincode, customerPincode, weightKg);
            
            const logisticsPayer = vendor.payoutConfig.logisticsPayer || 'customer';

            switch (logisticsPayer) {
                case 'vendor':
                    break;
                case 'shared':
                    totalCustomerCost += 69; // Customer pays a fixed amount
                    break;
                case 'customer':
                default:
                    totalCustomerCost += rate;
                    break;
            }
        } catch (error) {
            console.error(`Could not calculate shipping for item from vendor ${item.vendorId}:`, error);
            // Add a high, arbitrary cost for items that fail to calculate
            totalCustomerCost += 250;
        }
    }

    return totalCustomerCost;
}

/**
 * Gets a shipping estimate for a single product.
 * @param vendorId - The ID of the vendor for the product.
 * @param prepTime - The product's preparation time object.
 * @param prepTimeUnit - The unit for the prep time.
 * @param customerPincode - The customer's delivery pincode.
 * @returns A string describing the estimated delivery date.
 */
export async function getShippingEstimate(vendorId: string, prepTime: {min: number, max: number}, prepTimeUnit: 'days' | 'hours', customerPincode: string): Promise<string> {
    if (!customerPincode || !vendorId) {
        return 'Enter a pincode to see estimate.';
    }

    try {
        const vendor = await getVendorById(vendorId);
        if (!vendor || !vendor.pickupAddresses || vendor.pickupAddresses.length === 0) {
            throw new Error("Vendor address not found.");
        }

        const fromPincode = vendor.pickupAddresses[0].pincode;
        
        // Using a default weight of 1kg for estimation.
        const { etd } = await getShiprocketRate(fromPincode, customerPincode, 1);
        
        // "3-4 Days" -> 4
        const shippingDays = parseInt(etd.split('-').pop()?.trim().split(' ')[0] || '0', 10);
        const prepDays = prepTimeUnit === 'hours' ? Math.ceil(prepTime.max / 24) : prepTime.max;
        
        const totalMaxDays = prepDays + shippingDays + 1; // 1 Day buffer
        
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + totalMaxDays);
        
        return `Estimated delivery by ${deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}`;
    } catch(error: any) {
        console.error("Shipping estimate failed:", error.message);
        return "Could not estimate delivery at this time.";
    }
}
