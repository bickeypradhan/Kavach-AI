from typing import Dict, Any, List

class RiskEngine:
    def __init__(self):
        pass

    def evaluate_ppe_risk(self, violations: List[str], zone_risk: str) -> Dict[str, Any]:
        if not violations:
            return {"severity": "LOW", "reason": "Compliant worker"}

        is_high_risk_zone = zone_risk in ("HIGH", "CRITICAL")
        has_critical_ppe_missing = any(v in ("helmet", "vest") for v in violations)

        if is_high_risk_zone and has_critical_ppe_missing:
            return {
                "severity": "HIGH",
                "reason": f"Missing critical PPE ({', '.join(violations)}) in {zone_risk} risk zone"
            }
        elif len(violations) >= 2 or is_high_risk_zone:
            return {
                "severity": "HIGH" if is_high_risk_zone else "MEDIUM",
                "reason": f"Multiple PPE violations ({', '.join(violations)})"
            }
        else:
            return {
                "severity": "MEDIUM" if has_critical_ppe_missing else "LOW",
                "reason": f"Missing {violations[0]}"
            }

    def evaluate_hazard_risk(self, hazard_type: str, zone_name: str, confidence: float) -> Dict[str, Any]:
        if hazard_type == "fire":
            return {
                "severity": "CRITICAL",
                "reason": f"Active Fire detected in {zone_name} (Confidence: {int(confidence * 100)}%)"
            }
        elif hazard_type == "smoke":
            return {
                "severity": "HIGH",
                "reason": f"Smoke presence detected in {zone_name} (Confidence: {int(confidence * 100)}%)"
            }
        return {
            "severity": "MEDIUM",
            "reason": f"Environmental hazard ({hazard_type}) in {zone_name}"
        }
