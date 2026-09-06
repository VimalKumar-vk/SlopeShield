from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_locations: int
    high_risk_locations: int
    critical_locations: int
    active_alerts: int
    average_risk_score: float


class RiskDistribution(BaseModel):
    low: int
    moderate: int
    high: int
    critical: int


class RiskTrendPoint(BaseModel):
    date: str
    average_risk_score: float


class RiskTrends(BaseModel):
    trends: list[RiskTrendPoint]