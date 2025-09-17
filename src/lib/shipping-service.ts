
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
interface ShiprocketRateRequest {
    pickup_postcode: string;
    delivery_postcode: string;
    cod: 0 | 1;
    weight: number; // in kg
}

interface ShiprocketRate {
    courier_name: string;
    rate: number; // This is the final rate including COD charges etc.
    etd: string;
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
 * @returns The lowest available shipping rate and its ETD, or a high default if none are found.
 */
async function getShiprocketRate(fromPincode: string, toPincode: string, weightKg: number): Promise<ShippingEstimate> {
    const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external/courier/serviceability/";
    const SHIPROCKET_TOKEN = process.env.SHIPROCKET_API_TOKEN;

    if (!SHIPROCKET_TOKEN) {
        console.warn("Shiprocket API token not configured. Using simulated rate.");
        const baseRate = 60;
        const perKgRate = 30;
        const distanceFactor = 1.2;
        return {
            rate: Math.round((baseRate + (weightKg * perKgRate)) * distanceFactor),
            etd: "4-6 days"
        };
    }

    try {
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
            console.error("Shiprocket API Error:", await response.text());
            return { rate: 250, etd: '7-10 days' }; // High default on API error
        }

        const data = await response.json();

        if (data.status === 200 && data.data.available_courier_companies?.length > 0) {
            // Find the cheapest rate
            const cheapestCourier = data.data.available_courier_companies.reduce((cheapest: ShiprocketRate, current: ShiprocketRate) => {
                return current.rate < cheapest.rate ? current : cheapest;
            }, data.data.available_courier_companies[0]);
            
            return {
                rate: cheapestCourier.rate,
                etd: cheapestCourier.etd,
            };
        } else {
            console.warn("No couriers available for this route:", fromPincode, "->", toPincode);
            return { rate: 250, etd: '7-10 days' }; // High default if no couriers
        }
    } catch (error) {
        console.error("Failed to fetch Shiprocket rates:", error);
        return { rate: 250, etd: '7-10 days' }; // High default on network error
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

        if (!vendor || !vendor.pickupAddresses?.[0]?.pincode) {
            totalCustomerCost += 100 * item.quantity;
            continue;
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

    const vendor = await getVendorById(vendorId);
    if (!vendor || !vendor.pickupAddresses?.[0]?.pincode) {
        return 'Cannot estimate delivery at this time.';
    }

    const fromPincode = vendor.pickupAddresses[0].pincode;
    
    // Using a default weight of 1kg for estimation. In a more complex app, this might come from the product.
    const { etd } = await getShiprocketRate(fromPincode, customerPincode, 1);
    
    // "3-4 Days" -> 4
    const shippingDays = parseInt(etd.split('-').pop()?.trim().split(' ')[0] || '5', 10);
    const prepDays = prepTimeUnit === 'hours' ? Math.ceil(prepTime.max / 24) : prepTime.max;
    
    const totalMaxDays = prepDays + shippingDays + 1; // Added 1 day buffer
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + totalMaxDays);
    
    return `Estimated delivery by ${deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}`;
}
