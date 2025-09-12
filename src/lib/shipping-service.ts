
'use server';

import { getVendorById, type Vendor } from './vendors-service';
import type { CartItem } from '@/hooks/use-cart';

// A plain object that can be safely passed to a Server Action
export interface ShippingCartItem {
    vendorId: string;
    quantity: number;
    packaging: {
        weight: number;
    }
}

// --- Types ---

export interface ShippingCost {
    customerCost: number;
    vendorCost: number;
    totalCost: number;
}

// --- Service Functions ---

/**
 * Simulates fetching a shipping rate from an aggregator like Shiprocket.
 * In a real app, this would make an API call with weights, dimensions, and pincodes.
 * @param fromPincode - The vendor's pickup pincode.
 * @param toPincode - The customer's delivery pincode.
 * @param weightKg - The package weight in kilograms.
 * @returns A simulated total shipping cost.
 */
async function getSimulatedShippingRate(fromPincode: string, toPincode: string, weightKg: number): Promise<number> {
    // This is a very basic simulation. A real implementation would be much more complex.
    const baseRate = 60; // Base cost
    const perKgRate = 30;
    const distanceFactor = 1.2; // Simplified factor for pincode distance
    
    const cost = (baseRate + (weightKg * perKgRate)) * distanceFactor;
    return Math.round(cost);
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
    const vendorCache = new Map<string, Vendor | null>();

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
        const itemTotalShippingCost = await getSimulatedShippingRate(fromPincode, customerPincode, weightKg);
        
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
