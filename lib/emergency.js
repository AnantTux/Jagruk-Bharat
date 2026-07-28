/** Official and widely used Indian emergency numbers for coastal safety UI */
export const INDIAN_EMERGENCY = {
    national: { number: "112", label: "National Emergency (ERSS)" },
    police: { number: "100", label: "Police" },
    ambulance: { number: "108", label: "Ambulance (state EMS)" },
    fire: { number: "101", label: "Fire" },
    coastGuard: { number: "1554", label: "Indian Coast Guard" },
    disaster: { number: "1070", label: "NDMA disaster helpline" },
};
export const EMERGENCY_BANNER = `EMERGENCY: ${INDIAN_EMERGENCY.national.number} (National) · ${INDIAN_EMERGENCY.police.number} (Police) · ${INDIAN_EMERGENCY.ambulance.number} (Ambulance) · ${INDIAN_EMERGENCY.coastGuard.number} (Coast Guard)`;
