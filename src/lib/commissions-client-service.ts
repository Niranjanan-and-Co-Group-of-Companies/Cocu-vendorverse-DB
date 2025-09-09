
'use client';

import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import type { CommissionRule, Override } from './commissions-service';


export function onCommissionRulesUpdate(callback: (rules: CommissionRule[]) => void): () => void {
    const commissionsRef = collection(db, 'commissions');
    
    const unsubscribe = onSnapshot(commissionsRef, (snapshot) => {
        const rules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommissionRule));
        callback(rules);
    });
    
    return unsubscribe;
}

export function onOverridesUpdate(type: 'vendor' | 'product', callback: (overrides: Override[]) => void): () => void {
    const overridesRef = collection(db, `${type}CommissionOverrides`);
    
    const unsubscribe = onSnapshot(overridesRef, (snapshot) => {
        const overrides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Override));
        callback(overrides);
    });

    return unsubscribe;
}
