from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable, List
from math import isfinite

@dataclass
class Cashflow:
    date: datetime
    amount: float  # investments negative, redemptions/dividends positive

class XIRRInput(List[Cashflow]):
    pass

def _npv(rate: float, cashflows: Iterable[Cashflow]) -> float:
    t0 = min(cf.date for cf in cashflows)
    total = 0.0
    for cf in cashflows:
        days = (cf.date - t0).days
        total += cf.amount / (1.0 + rate) ** (days / 365.0)
    return total

def xirr(cashflows: Iterable[Cashflow], guess: float = 0.15, tol: float = 1e-7, max_iter: int = 100) -> float:
    # Newton-Raphson
    rate = guess
    for _ in range(max_iter):
        t0 = min(cf.date for cf in cashflows)
        f = 0.0
        df = 0.0
        for cf in cashflows:
            days = (cf.date - t0).days
            frac = days / 365.0
            denom = (1.0 + rate) ** frac
            f += cf.amount / denom
            df -= frac * cf.amount / denom / (1.0 + rate)
        if abs(f) < tol and isfinite(rate):
            return rate
        step = f / df if df != 0 else 0
        rate -= step
        if abs(step) < tol:
            return rate
    return rate
