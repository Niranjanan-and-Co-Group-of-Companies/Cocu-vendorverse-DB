
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

// --- Service Functions ---

/**
 * Fetches available courier rates from the Shiprocket API.
 * @param fromPincode - The vendor's pickup pincode.
 * @param toPincode - The customer's delivery pincode.
 * @param weightKg - The package weight in kilograms.
 * @returns The lowest available shipping rate, or a high default if none are found.
 */
async function getShiprocketRate(fromPincode: string, toPincode: string, weightKg: number): Promise<number> {
    const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external/courier/serviceability/";
    const SHIPROCKET_TOKEN = process.env.SHIPROCKET_API_TOKEN;

    if (!SHIPROCKET_TOKEN) {
        console.warn("Shiprocket API token not configured. Using simulated rate.");
        // Fallback to simulation if token is missing
        const baseRate = 60;
        const perKgRate = 30;
        const distanceFactor = 1.2;
        return Math.round((baseRate + (weightKg * perKgRate)) * distanceFactor);
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
                cod: 0, // Assuming non-COD for simplicity
            }),
        });

        if (!response.ok) {
            console.error("Shiprocket API Error:", await response.text());
            return 250; // Return a high default on API error
        }

        const data = await response.json();

        if (data.status === 200 && data.data.available_courier_companies?.length > 0) {
            // Find the cheapest rate
            const lowestRate = data.data.available_courier_companies.reduce((min: number, courier: ShiprocketRate) => {
                return courier.rate < min ? courier.rate : min;
            }, Infinity);
            return lowestRate;
        } else {
            console.warn("No couriers available for this route:", fromPincode, "->", toPincode);
            return 250; // High default if no couriers are available
        }
    } catch (error) {
        console.error("Failed to fetch Shiprocket rates:", error);
        return 250; // High default on network or parsing error
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
            // If vendor or pincode is missing, assume a default high shipping cost for now
            totalCustomerCost += 100 * item.quantity;
            continue;
        }

        const fromPincode = vendor.pickupAddresses[0].pincode;
        const weightKg = (item.packaging?.weight || 0.5) * item.quantity;

        // Get the total shipping cost for this item/vendor
        const itemTotalShippingCost = await getShiprocketRate(fromPincode, customerPincode, weightKg);
        
        const logisticsPayer = vendor.payoutConfig.logisticsPayer || 'customer';

        switch (logisticsPayer) {
            case 'vendor':
                // Vendor pays all, so customer cost is 0 for this item.
                break;
            case 'shared':
                // Customer pays a fixed amount (e.g., 69), vendor pays the rest.
                const customerShare = 69;
                totalCustomerCost += customerShare;
                break;
            case 'customer':
            default:
                // Customer pays the full amount for this item.
                totalCustomerCost += itemTotalShippingCost;
                break;
        }
    }

    return totalCustomerCost;
}
